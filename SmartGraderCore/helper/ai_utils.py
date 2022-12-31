import base64
import os

import cv2
import numpy as np
from django.core.files.storage import FileSystemStorage
from pdf2image import convert_from_path

from eventmanager.models import Upload
from helper.exceptions import ValidationException
import math
import scipy.ndimage as ndimage
from keras.models import load_model
from operator import itemgetter


def compute_homography_orb(src_img, target_img):
    MAX_FEATURES = 500
    GOOD_MATCH_PERCENT = 0.02
    # Convert images to grayscale

    im1Gray = cv2.cvtColor(src_img, cv2.COLOR_BGR2GRAY)
    im2Gray = cv2.cvtColor(target_img, cv2.COLOR_BGR2GRAY)

    # Detect ORB features and compute descriptors.
    orb = cv2.ORB_create(MAX_FEATURES)
    keypoints1, descriptors1 = orb.detectAndCompute(im1Gray, None)
    keypoints2, descriptors2 = orb.detectAndCompute(im2Gray, None)

    #   # Match features.
    index_params = dict(algorithm=6,
                        table_number=6,
                        key_size=12,
                        multi_probe_level=2)
    search_params = {}
    flann = cv2.FlannBasedMatcher(index_params, search_params)
    matches = flann.knnMatch(descriptors1, descriptors2, k=2)

    # As per Lowe's ratio test to filter good matches
    good_matches = []
    for m, n in matches:
        if m.distance < 0.75 * n.distance:
            good_matches.append(m)

    # Remove not so good matches

    #     numGoodMatches = int(len(matches) * GOOD_MATCH_PERCENT)
    matches = good_matches
    # Extract location of good matches
    points1 = np.zeros((len(matches), 2), dtype=np.float32)
    points2 = np.zeros((len(matches), 2), dtype=np.float32)
    for i, match in enumerate(matches):
        points1[i, :] = keypoints1[match.queryIdx].pt
        points2[i, :] = keypoints2[match.trainIdx].pt

    # Find homography
    h, mask = cv2.findHomography(points1, points2, cv2.RANSAC)
    return h


def get_images_from_pdf(from_file_path, DPI):
    print('--------------------------------------')
    print('filepath =', from_file_path)
    print('--------------------------------------')
    images = convert_from_path(from_file_path, dpi=DPI)
    ret_images = []
    for img in images:
        opencvImage = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        ret_images.append(opencvImage)
    return ret_images


def calibrate_images(from_file_path, target_file_path):
    DPI = 100
    low_target_images = get_images_from_pdf(target_file_path, DPI)
    # DPI = 300
    # high_target_images = get_images_from_pdf(target_file_path, DPI)
    DPI = 100
    low_images = get_images_from_pdf(from_file_path, DPI)
    DPI = 300
    high_images = get_images_from_pdf(from_file_path, DPI)

    n = len(high_images)
    if n != len(low_target_images):
        raise ValidationException('Number of pages must be same in source and target PDF')
    if n == 0:
        return []
    source_shape = np.shape(low_images[0])
    target_shape = np.shape(high_images[0])
    pts1 = np.float32([[0, 0], [source_shape[0], 0], [0, source_shape[1]], [source_shape[0], source_shape[1]]])
    pts2 = np.float32([[0, 0], [target_shape[0], 0], [0, target_shape[1]], [target_shape[0], target_shape[1]]])
    src_to_tgt = cv2.getPerspectiveTransform(pts1, pts2)
    tgt_to_src = cv2.getPerspectiveTransform(pts2, pts1)
    # project_down = np.zeros((3, 3))
    # project_down = [
    #     [0.33, 0, 0],
    #     [0, 0.33, 0],
    #     [0, 0, 1]]
    #
    # project_up = np.zeros((3, 3))
    # project_up = [
    #     [3, 0, 0],
    #     [0, 3, 0],
    #     [0, 0, 1]]
    #
    # # In[62]:
    #
    # # C = np.dot(Mat1,matrix_A)
    # C = np.dot(np.dot(project_up, Mat1), project_down)

    height, width, channels = high_images[0].shape
    print('hhhhhhhhhh=', height)
    print('wwwwwwwwwwwww=', width)
    channels = 3
    output = []
    for i in range(0, n):
        print('aaaaaaaaaaaaaaaa=', i)
        h_matrix = compute_homography_orb(low_images[i], low_target_images[i])
        transformed_h = np.dot(np.dot(src_to_tgt, h_matrix), tgt_to_src)
        calibrated_img = cv2.warpPerspective(high_images[i], transformed_h, (width, height))

        # calibrated_img = cv2.cvtColor(calibrated_img, cv2.COLOR_BGR2RGB)
        # im_pil = Image.fromarray(calibrated_img)
        output.append(calibrated_img)
    return output


##############################################3
##### Roll number recognition##############
######################################

def removeBlack(gray):
    while np.sum(gray[0]) == 0:
        gray = gray[1:]

    while np.sum(gray[:, 0]) == 0:
        gray = np.delete(gray, 0, 1)

    while np.sum(gray[-1]) == 0:
        gray = gray[:-1]

    while np.sum(gray[:, -1]) == 0:
        gray = np.delete(gray, -1, 1)
    return gray;


def divide_largest_chunk(letters):
    l = [digit.shape[1] for digit in letters]
    i = np.argmax(l)
    digit = letters[i]
    del letters[i]
    digit1, digit2 = digit[:, :int(digit.shape[1] / 2)], digit[:, int(digit.shape[1] / 2):]
    letters.insert(i, digit1)
    letters.insert(i + 1, digit2)


def preprocess_image1(roll_img, digits_len):
    print('----------------------------------')
    print('shape of roll_img =', roll_img.shape)
    print('----------------------------------')
    thresh = cv2.adaptiveThreshold(roll_img, 255, cv2.ADAPTIVE_THRESH_MEAN_C, \
                                   cv2.THRESH_BINARY_INV, 7, 10)
    print('----------------------------------')
    print('shape of thresh =', thresh.shape)
    print('----------------------------------')
    # kernel = np.ones((4,4),np.uint8)
    # dilation = cv2.dilate(thresh,kernel,iterations = 1)
    # kernel = np.ones((2,2),np.uint8)
    # erosion = cv2.erode(thresh,kernel,iterations = 1)
    _, contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

    # step 1: remove contors whose area is less than 50
    contors = [cont for cont in contours if cv2.contourArea(cont) > 50]

    cc_list = []
    cc_list_ = []
    x_axis_list = []
    y_axis_list = []
    sum_h = 0
    sum_w = 0
    for contor in contors:
        x, y, w, h = cv2.boundingRect(contor)

        cc = thresh[y:y + h, x:x + w]
        cc_list.append(cc)
        x_axis_list.append(x)
        y_axis_list.append(y)
        sum_h += h
        sum_w += w
    # characteristic rectangle (CR) has width as sum_w and height = max_h
    pitch = float(sum_w / digits_len)
    heigt = float(sum_h / digits_len)

    # step 2: if width > 1.5* pitch and width < 2.25* pitch

    #     print('before step 2 =',digits_len)
    #     print(len(cc_list))
    #     for cnt in cc_list:
    #         plt.figure(figsize = (4,4))
    #         plt.imshow(cnt,cmap='gray')
    #         plt.show()
    if len(cc_list) != digits_len:
        i = 0
        while i < len(cc_list):
            #         print(i,',',len(cc_list))
            w = cc_list[i].shape[1]
            if w > 2 * pitch:  # and w <2.25*pitch
                ximg = cc_list[i][:, 0:int(w / 2)]
                yimg = cc_list[i][:, int(w / 2):]

                _, c1, _ = cv2.findContours(ximg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
                v_contors = [cont for cont in c1 if cv2.contourArea(cont) > 50]
                for c in v_contors:
                    x, y, w, h = cv2.boundingRect(c)
                    cc_list.append(ximg[y:y + h, x:x + w])
                    x_axis_list.append(x_axis_list[i] + x)
                    y_axis_list.append(y_axis_list[i] + y)

                _, c2, _ = cv2.findContours(yimg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
                v_contors = [cont for cont in c2 if cv2.contourArea(cont) > 50]
                for c in v_contors:
                    x, y, w, h = cv2.boundingRect(c)
                    cc_list.append(yimg[y:y + h, x:x + w])
                    x_axis_list.append(x_axis_list[i] + x + int(w / 2))
                    y_axis_list.append(y_axis_list[i] + y)
                del cc_list[i]
                del x_axis_list[i]
                del y_axis_list[i]
            i += 1

    # step 3:attach to the nearest segment if height of segment is less than half

    #     print('before step 3')
    #     print(len(cc_list))
    #     for cnt in cc_list:
    #         plt.figure(figsize = (4,4))
    #         plt.imshow(cnt,cmap='gray')
    #         plt.show()

    if len(cc_list) != digits_len:
        i = 0
        while i < len(cc_list):
            if cc_list[i].shape[0] < float(heigt * 0.60):
                # TODO: find the nearest contour and attach it to that contour
                x, y, h, w = x_axis_list[i], y_axis_list[i], cc_list[i].shape[0], cc_list[i].shape[1]
                cx_i, cy_i = x + float(w / 2), y + float(h / 2)
                min_d = 1000
                min_i = -1
                for j in range(len(cc_list)):
                    x1, y1, h1, w1 = x_axis_list[j], y_axis_list[j], cc_list[j].shape[0], cc_list[j].shape[1]
                    cx_j, cy_j = x1 + float(w1 / 2), y1 + float(h1 / 2)
                    p1 = np.array((cx_i, cy_i))
                    p2 = np.array((cx_j, cy_j))
                    dis = np.linalg.norm(p1 - p2)
                    if (dis < min_d and j != i):
                        min_i = j
                        min_d = dis
                        # stack one image over other vertically
                if min_i != -1:
                    img1 = cc_list[i]
                    img2 = cc_list[min_i]
                    res = np.zeros((100, 500))
                    x1_offset, y1_offset = x_axis_list[i], y_axis_list[i]
                    x2_offset, y2_offset = x_axis_list[min_i], y_axis_list[min_i]
                    res[y1_offset:y1_offset + img1.shape[0], x1_offset:x1_offset + img1.shape[1]] = img1
                    res[y2_offset:y2_offset + img2.shape[0], x2_offset:x2_offset + img2.shape[1]] = img2
                    res = removeBlack(res)
                    cc_list[min_i] = res
                    x_axis_list[min_i] = min(x1_offset, x2_offset)
                    y_axis_list[min_i] = min(y1_offset, y2_offset)
                    del cc_list[i]
                    del x_axis_list[i]
                    del y_axis_list[i]
                    i -= 1
            i += 1

    #     print('after step 3')
    #     print(len(cc_list))
    #     for cnt in cc_list:
    #         plt.figure(figsize = (4,4))
    #         plt.imshow(cnt,cmap='gray')
    #         plt.show()
    cc_list_ = []
    if len(cc_list) == digits_len:
        x_axis_sorted = sorted(range(len(x_axis_list)), key=lambda k: x_axis_list[k])
        cc_list_ = [cc_list[k] for k in x_axis_sorted]
    elif len(cc_list) == digits_len - 1:
        x_axis_sorted = sorted(range(len(x_axis_list)), key=lambda k: x_axis_list[k])
        cc_list_ = [cc_list[k] for k in x_axis_sorted]
        i = np.argmax([a.shape[1] for a in cc_list_])
        w = cc_list_[i].shape[1]
        img = cc_list_[i]
        cc_list_[i] = img[:, :int(w / 2)]
        cc_list_.insert(i + 1, img[:, int(w / 2):])
    else:
        x_axis_sorted = sorted(range(len(x_axis_list)), key=lambda k: x_axis_list[k])
        cc_list_ = [cc_list[k] for k in x_axis_sorted]

    print('------------------------------------')
    print('length of contours in preprocess=', len(cc_list_))
    print('------------------------------------')
    output = {'contours': cc_list_, 'image': thresh}
    # return cc_list_, thresh
    return output


def getBestShift(img):
    cy, cx = ndimage.measurements.center_of_mass(img)
    rows, cols = img.shape
    shiftx = np.round(cols / 2.0 - cx).astype(int)
    shifty = np.round(rows / 2.0 - cy).astype(int)
    return shiftx, shifty


def shift(img, sx, sy):
    rows, cols = img.shape
    M = np.float32([[1, 0, sx], [0, 1, sy]])
    shifted = cv2.warpAffine(img, M, (cols, rows))
    return shifted


def preprocess_image_wise(gray):
    rows, cols = gray.shape

    try:
        if rows > cols:
            factor = 20.0 / rows
            rows = 20
            cols = int(round(cols * factor))
            gray = cv2.resize(gray, (cols, rows))
        else:
            factor = 20.0 / cols
            cols = 20
            rows = int(round(rows * factor))
            gray = cv2.resize(gray, (cols, rows))
    except:
        print('error occured')

    # padding the images and make it 28*28
    colsPadding = (int(math.ceil((28 - cols) / 2.0)), int(math.floor((28 - cols) / 2.0)))
    rowsPadding = (int(math.ceil((28 - rows) / 2.0)), int(math.floor((28 - rows) / 2.0)))
    gray = np.lib.pad(gray, (rowsPadding, colsPadding), 'constant')
    shiftx, shifty = getBestShift(gray)
    shifted = shift(gray, shiftx, shifty)
    gray = shifted / 255
    return gray


def lcs(X, Y):
    # find the length of the strings
    m = len(X)
    n = len(Y)

    # declaring the array for storing the dp values
    L = [[None] * (n + 1) for i in range(m + 1)]

    """Following steps build L[m+1][n+1] in bottom up fashion 
    Note: L[i][j] contains length of LCS of X[0..i-1] 
    and Y[0..j-1]"""
    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 or j == 0:
                L[i][j] = 0
            elif X[i - 1] == Y[j - 1]:
                L[i][j] = L[i - 1][j - 1] + 1
            else:
                L[i][j] = max(L[i - 1][j], L[i][j - 1])

                # L[m][n] contains the length of LCS of X[0..n-1] & Y[0..m-1]
    return L[m][n]


def commonChars(X, Y):
    # find the length of the strings
    m = len(X)
    n = len(Y)
    #     if m!=n:
    #         return 0
    common_chars = 0
    for i in range(min(m, n)):
        if X[i] == Y[i]:
            common_chars += 1
    return common_chars


def commonChars2(X, Y):
    # find the length of the strings
    m = len(X)
    n = len(Y)
    short = X
    longer = Y
    if m > n:
        short = Y
        longer = X

    ret_val = -1
    for i in range(len(longer) - len(short) + 1):
        common_chars = 0
        for j in range(i, len(short) + i):
            #             print('j=',j,',i=',j-i)
            if short[j - i] == longer[j]:
                common_chars += 1
        ret_val = max(ret_val, common_chars)
    return ret_val


def getEnrollLengths(enrollments):
    lengths = set()
    for e in enrollments:
        lengths.add(len(e))
    return lengths


def sortSecond(val):
    return val[1]


def get_roll_number_box(course_dirs, file_path, roll_coords):
    if not file_path.name:
        return None
    f_path = file_path.path
    file_name = file_path.name
    dir_name = file_name[:-4]
    img_dirs = course_dirs
    img_dir = img_dirs + '/' + dir_name
    image = {}
    file_system_storage = FileSystemStorage()
    image_list = file_system_storage.listdir(img_dir)
    image_name_list = image_list[1]
    # image_name_list = image_list
    image_name_list.sort()
    image_file_name = image_name_list[0]
    image_path = os.path.join(img_dir, image_file_name)
    # encoding = read_file(image_path)
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    coords = roll_coords.split(',')
    i_coords = []
    for c in coords:
        i_coords.append(int(c))
    cropped_img = img[i_coords[1]:i_coords[3], i_coords[0]:i_coords[2]]
    return cropped_img


def predict_roll_no(img, roll_length, p_c, model):
    output = {'predicted_no': 0, 'confidence': 0}
    # try:

    # x, img = preprocess_image1(img, len)
    preprocess_op = preprocess_image1(img, roll_length)
    x = preprocess_op['contours']
    img = preprocess_op['image']

    print('------------------------------------')
    print('length of contours in parent=', len(x))
    print('------------------------------------')
    if len(x) == 0:
        print('2......no contours found')
        output = {'predicted_no': 0, 'confidence': 0}
        return output
    # except:
    #     print('3......exception found in preprocess_image')
    #     return output
    val = ''
    tp = 1;

    for j in range(len(x)):
        img = x[j]
        try:
            processed_img = preprocess_image_wise(img)
            reshaped_image = processed_img.reshape(1, 28, 28, 1)
            p = model.predict(reshaped_image, None, None)
            max_v = -1
            max_i = -1
            if j < len(p_c):
                for y in p_c[j]:
                    if p[0][y] > max_v:
                        max_v = p[0][y]
                        max_i = y

            val += str(max_i)
            tp *= np.max(p)
        except:
            print('error occured')
            output = {'predicted_no': 0, 'confidence': 0}
            return output
    tp = tp ** (1 / len(x))
    print('predicted no =', val, ', confidence =', tp)
    output = {'predicted_no': val, 'confidence': tp}
    return output


def get_predictions(users_data, roll_numbers, course_dirs):
    enrollment_lengths = getEnrollLengths(roll_numbers)
    print('1......enrollment lengths=', enrollment_lengths)
    # find the possible characters at each index in prediction
    max_l = np.max([len(str(x)) for x in roll_numbers])
    p_c = [set() for _ in range(max_l)]
    for s in roll_numbers:
        st = str(s)
        for i, x in enumerate(st):
            p_c[i].add(int(x))
    for i in range(len(p_c)):
        p_c[i] = list(p_c[i])
    print(p_c)
    # p_c = [[1], [9, 5, 6, 7], [0, 1, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    #        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]]
    img_dirs = course_dirs
    img_dir = img_dirs + 'AImodels/mnist_keras_cnn_model_0.9977_robust.h5'
    model = load_model(img_dir)
    for data in users_data:
        for length in enrollment_lengths:
            pred = predict_roll_no(data['roll_no_img'], length, p_c, model)
            if pred['confidence'] > data['confidence']:
                data['confidence'] = pred['confidence']
                data['predicted_no'] = pred['predicted_no']
    return users_data


def process_preds_using_course_data(users_data, roll_numbers):
    # step 1: map predicted to enrollments based on confidence score
    incorrect_pred = []
    enroll_pred_dict = {}
    for e in roll_numbers:
        enroll_pred_dict[str(e)] = {'confidence': -1, 'index': -1}  # confidence score, index
    for i in range(len(users_data)):
        row = users_data[i]
        curr = {'confidence': row['confidence'], 'index': i}
        if row['predicted_no'] in enroll_pred_dict and curr['confidence'] > enroll_pred_dict[row['predicted_no']][
            'confidence']:
            if enroll_pred_dict[row['predicted_no']]['confidence'] != -1:
                print('conflict')
                incorrect_pred.append(enroll_pred_dict[row['predicted_no']])
            enroll_pred_dict[row['predicted_no']] = curr
        else:
            incorrect_pred.append(curr)
    rem_enrollments = []
    for e in roll_numbers:
        e = str(e)
        if enroll_pred_dict[e]['index'] == -1:
            rem_enrollments.append(e)
    print('total incorrect pred =', len(incorrect_pred))
    # step 2: remaining predicted, remaining enrollments --> map based on longest common subsequence
    #     print(len(rem_enrollments))
    incorrect_pred_2 = []
    for row in incorrect_pred:

        lcs_len = 0
        ind = row['index']
        #         print(row,',', str(predicted[ind][0]))
        updated_predicted = ''

        for enroll in rem_enrollments:

            tmp_len = lcs(enroll, str(users_data[ind]['predicted_no']))
            if (tmp_len > lcs_len):
                #                 print(enroll,',',predicted[ind][0],',',tmp_len)
                lcs_len = tmp_len
                updated_predicted = enroll
        if lcs_len <= 1:
            incorrect_pred_2.append(row)
        else:
            users_data[ind]['predicted_no'] = updated_predicted
            users_data[ind]['confidence'] = 0.25 * users_data[ind]['confidence']
            rem_enrollments.remove(updated_predicted)

    # step 3 just map remaining serially
    #     for i in range(len(incorrect_pred_2)):
    #         row = incorrect_pred_2[i]
    #         ind = row['index']
    #         predicted[ind][0] = rem_enrollments[i]
    print(len(incorrect_pred_2))
    return users_data


def get_roll_numbers(course_dirs, roll_coords, roll_numbers, course_id,subevent_id):
    # fetch roll number boxes
    users_data = []
    uploads = Upload.objects.filter(is_bulk_upload=True, is_paginated=False,subevent_id=subevent_id)
    for upload in uploads:
        image = get_roll_number_box(course_dirs, upload.file_path, roll_coords)
        data = {'upload_id': upload.id, 'roll_no_img': image, 'predicted_no': 0, 'confidence': 0}
        users_data.append(data)
    # get roll no predictions using AI computation
    predictions = get_predictions(users_data, roll_numbers, course_dirs)
    processed_preds = process_preds_using_course_data(predictions, roll_numbers)

    sorted_dict = sorted(processed_preds, key=itemgetter('confidence'))
    for pred in sorted_dict:
        img = cv2.imencode('.jpg', pred['roll_no_img'])[1].tobytes()
        content = base64.b64encode(img)
        pred['roll_no_img'] = content
        conf = "{:.2f}".format(pred['confidence'] * 100)
        pred['confidence'] = conf
    return sorted_dict


#######################################################
###############AutoGrading APIs########################
#######################################################
def get_answer_box(image_path, ans_coords):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    coords = ans_coords.split(',')
    i_coords = []
    for c in coords:
        i_coords.append(int(c))
    cropped_img = img[i_coords[1]:i_coords[3], i_coords[0]:i_coords[2]]
    return cropped_img


def sort_contours(cnts, method="top-to-bottom"):
    # initialize the reverse flag and sort index
    reverse = False
    i = 0
    # handle if we need to sort in reverse
    if method == "right-to-left" or method == "bottom-to-top":
        reverse = True
    # handle if we are sorting against the y-coordinate rather than
    # the x-coordinate of the bounding box
    if method == "top-to-bottom" or method == "bottom-to-top":
        i = 1

    print('------------no of contours----------------------------')
    print(len(cnts))
    print('------------no of contours----------------------------')
    # construct the list of bounding boxes and sort them from top to
    # bottom
    boundingBoxes = [cv2.boundingRect(c) for c in cnts]
    (cnts, boundingBoxes) = zip(*sorted(zip(cnts, boundingBoxes),
                                        key=lambda b: b[1][i], reverse=reverse))
    # return the list of sorted contours and bounding boxes
    return (cnts, boundingBoxes)


def find_autograde_contours(src_path, coords, question_cnt=1):
    print('------------coords----------------------------')
    print(coords)
    print('------------coords----------------------------')
    print('------------src_path----------------------------')
    print(src_path)
    print('------------src_path----------------------------')
    print('------------no of question_cnt----------------------------')
    print(question_cnt)
    print('------------no of question_cnt----------------------------')
    #     image = cv2.imread(src_path)
    image = get_answer_box(src_path, coords)
    # convert the resized image to grayscale, blur it slightly,
    # and threshold it
    #     gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    #     blurred = cv2.GaussianBlur(image, (5, 5), 0)
    #     thresh = cv2.threshold(blurred, 60, 255, cv2.THRESH_BINARY)[1]
    #     # find contours in the thresholded image and initialize the
    #     # shape detector
    #     _,cnts,_ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,
    #         cv2.CHAIN_APPROX_SIMPLE)

    thresh = cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 7, 10)
    #     kernel = np.ones((4,4),np.uint8)
    #     dilation = cv2.dilate(thresh,kernel,iterations = 1)
    #     kernel = np.ones((2,2),np.uint8)
    #     erosion = cv2.erode(thresh,kernel,iterations = 1)
    #     _,contours,hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
    #     cv2.drawContours(image, contours, -1, (0, 255, 0), 2,8,hierarchy,2)
    _, contours, hierarchy = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    #     cv2.drawContours(image, contours, -1, (0, 255, 0), 2,8,hierarchy,2)

    image_size = image.size
    expected_area = image_size / question_cnt
    filtered_cntr = []
    for cntr in contours:
        approx = cv2.approxPolyDP(cntr, 0.01 * cv2.arcLength(cntr, True), True)

        area = cv2.contourArea(cntr)
        if area > expected_area / 2 and area <= expected_area:
            filtered_cntr.append(cntr)
    #     cv2.drawContours(image, filtered_cntr, -1, (0, 255, 0),2)
    #     cv2.imshow('Contours', image)
    #     cv2.waitKey(0)
    #     cv2.destroyAllWindows()
    #     print(contours)
    cc_list = []
    (sorted_cntrs, _) = sort_contours(filtered_cntr, method="top-to-bottom")
    for contour in sorted_cntrs:
        x, y, w, h = cv2.boundingRect(contour)
        cc = thresh[y:y + h, x:x + w]
        cc_list.append(cc)
    return cc_list


def predict_gd_TF(gd_entry, q_ans_coords, no_of_contours, model):
    # get image
    result = []
    src_path = gd_entry['src_image_path']
    gd_id = gd_entry['gd_id']
    cc_list = find_autograde_contours(src_path, q_ans_coords, no_of_contours)
    id = 0
    for img in cc_list:
        result_entry = {'gd_id':gd_id,'subquestion_id': id, 'img': None, 'predicted_label': None,
                        'predicted_char': None, 'confidence': None}
        resized_image = cv2.resize(img, (100, 100))
        resized_image = resized_image[6:-6, 6:-6]
        test_img = np.array(resized_image)
        reshaped_test_img = test_img.reshape(1,88, 88, 1)
        model_result = model.predict(reshaped_test_img)
        predicted_label = 0
        confidence = -1
        for i in range(len(model_result[0])):
            if model_result[0][i] > confidence:
                predicted_label = i
                confidence = model_result[0][i]
        img_content = cv2.imencode('.jpg', img)[1].tobytes()
        content = base64.b64encode(img_content)
        result_entry['img'] = content
        result_entry['predicted_label'] = predicted_label
        conf = "{:.2f}".format(confidence * 100)
        result_entry['confidence'] = conf
        if predicted_label == 0:
            result_entry['predicted_char'] = 'T'
        elif predicted_label == 1:
            result_entry['predicted_char'] = 'F'
        else:
            result_entry['predicted_char'] = 'O'
        result.append(result_entry)
        id+=1
    return result

    # crop image
    # detect contours
    # sort boxes
    # predict the box


def getTFPredictions(processed_gd_data, q_ans_coords, no_of_contours, course_dirs):
    img_dirs = course_dirs
    img_dir = img_dirs + 'AImodels/T_F_keras_cnn_model_2_robust.h5'
    model = load_model(img_dir)
    output_data = []
    for gd_entry in processed_gd_data:
        # gd_predictions = predict_gd_TF(gd_entry, q_ans_coords, no_of_contours, model)
        # gd_prediction['gd_id'] = gd_entry['gd_id']

        # get image
        # result = []
        src_path = gd_entry['src_image_path']
        gd_id = gd_entry['gd_id']
        cc_list = find_autograde_contours(src_path, q_ans_coords, no_of_contours)
        id = 0
        for img in cc_list:
            result_entry = {'gd_id': gd_id, 'subquestion_id': id, 'img': None, 'predicted_label': None,
                            'predicted_char': None, 'confidence': None}
            resized_image = cv2.resize(img, (100, 100))
            resized_image = resized_image[6:-6, 6:-6]
            test_img = np.array(resized_image)
            reshaped_test_img = test_img.reshape(1, 88, 88, 1)
            model_result = model.predict(reshaped_test_img)
            predicted_label = 0
            confidence = -1
            for i in range(len(model_result[0])):
                if model_result[0][i] > confidence:
                    predicted_label = i
                    confidence = model_result[0][i]
            resized_image = cv2.resize(img, (50, 50))
            img_content = cv2.imencode('.jpg', resized_image)[1].tobytes()
            content = base64.b64encode(img_content)
            result_entry['img'] = content
            result_entry['predicted_label'] = predicted_label
            conf = "{:.2f}".format(confidence * 100)
            result_entry['confidence'] = conf
            if predicted_label == 0:
                result_entry['predicted_char'] = 'T'
            elif predicted_label == 1:
                result_entry['predicted_char'] = 'F'
            else:
                result_entry['predicted_char'] = 'O'
            # result.append(result_entry)
            output_data.append(result_entry)
            id += 1

        # for pred in gd_predictions:
        #     output_data.append(pred)
    sorted_dict = sorted(output_data, key=itemgetter('confidence'))
    return sorted_dict
