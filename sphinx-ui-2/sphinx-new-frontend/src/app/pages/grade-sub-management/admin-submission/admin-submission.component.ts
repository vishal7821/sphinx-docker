import { Component, OnInit } from '@angular/core';
import { NbToastrService, NbIconLibraries } from '@nebular/theme';
import { GradeSubMngmtService } from '../grade-sub-management.service';
import { PageRouterService } from '../../page-router.service';
import { MyEventClass } from '../../myevents/myevents.model';
import { Upload } from '../grade-sub-management.model';

@Component({
  selector: 'admin-submission',
  templateUrl: './admin-submission.component.html',
  styleUrls: ['./admin-submission.component.scss']
})
export class AdminSubmissionComponent implements OnInit {

   /**
   * boolean flag used to disable action button to prevent multiple duplicate operation requests.
   */
  isDisabled: boolean = false;

    /**
   * boolean flag used to show loading icon in view
   */
  isLoading = false;
  isRecLoading = false;
  /**
   * list variable used to bind user input CSV file from dropzone
   */
  public uploadedFiles: Array<File> = [];
  uploads: Upload[] = []

  recUploads: Upload[] = []
  submissionEventID: number = -1;
  submissionSubeventID: number = -1;
  message:String = '';
  constructor(
    iconsLibrary: NbIconLibraries,
    public gradesubmngmt_service: GradeSubMngmtService,
    private toastr: NbToastrService,
    private pageRouter: PageRouterService,
  ) {
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });
   }

  ngOnInit() {
  
    this.submissionEventID = JSON.parse(localStorage.getItem('AdminSubmissionEventID'));
    this.submissionSubeventID = JSON.parse(localStorage.getItem('AdminSubmissionSubEventID'));

    this.fetchSubmissions();
  }

  public userRecognition(){
    this.isRecLoading = true;
    this.tempMessage = this.message;
    this.message = 'The requested operation might take some time';
    this.gradesubmngmt_service.recognizeStudents().subscribe(
      responseData => {
        let data: any[];
        data = responseData;

        const extractedUploads: Upload[] = [];
        for (let i = 0; i < data.length; i++) {
            const upload = new Upload(
                i + 1,
                data[i].upload_id,
                data[i].confidence,
                "data:image/jpg;base64," + data[i].roll_no_img,
                data[i].predicted_no,
            );
            extractedUploads.push(upload);
        }
        
        this.recUploads = extractedUploads;
        console.log(this.recUploads);
        // console.log('users recognised = ',responseData);
        if(this.recUploads.length ==0){
          this.toastr.success('There are no unmapped student submissions present at the moment.', 'Success');
        }else{
          this.toastr.success('Students roll numbers predicted successfully.', 'Success');
        }
        
        this.isRecLoading = false;
        this.message = this.tempMessage;
      },
      error => {
        console.log('error' + error);
        this.isRecLoading = false;
        this.message = this.tempMessage;
        this.toastr.danger('server is not available', 'Server Error');
        // this.toastr.danger(error.error.detail, 'File upload Error');
      },
    );
  }
  public onMapSubmission(){
    this.isRecLoading = true;
    let upload_ids:number[]=[]
    let roll_nos:string[]=[]
    for(let i=0; i < this.recUploads.length ; i++){
      upload_ids.push(this.recUploads[i].upload_id);
      roll_nos.push(this.recUploads[i].roll_number);
    }
    this.gradesubmngmt_service.mapSubmission(this.submissionEventID , this.submissionSubeventID,
      upload_ids, roll_nos).subscribe(
        resData => {
          console.log(this.recUploads);
          // console.log('users recognised = ',responseData);
          this.toastr.success('Students submissions mapped successfully.', 'Success');
          this.isRecLoading = false;
          this.recUploads = [];
          this.fetchSubmissions();

        },
        error => {
          console.log('error' + error);
          this.toastr.danger('server is not available', 'Server Error');
          this.isRecLoading = false;
        },
      );
  }
  public onDelSubmission(idx: number){
    const upload_id = this.uploads[idx].upload_id;
    this.gradesubmngmt_service.delBulkUploadSubmission
    (this.submissionEventID , this.submissionSubeventID,
      upload_id).subscribe(
        resData => {
          
          // console.log('users recognised = ',responseData);
          this.toastr.success('Submission deleted successfully', 'Success');
          this.uploads.splice(idx, 1);
        },
        error => {
          console.log('error' + error.error);
          this.toastr.danger(error.error.detail, 'Server Error');
        },
      );
  }

  public onDownloadSubmission(idx: number){
    const upload_id = this.uploads[idx].upload_id;
    this.gradesubmngmt_service.getBulkUploadSubmission
    (this.submissionEventID , this.submissionSubeventID,
      upload_id).subscribe(
        resData => {
          
          // console.log('users recognised = ',responseData);
          
          console.log(resData);
          let file_name : string = resData.file_name;
          if(file_name == null || file_name ==''){
            file_name = "submission.pdf";
          }
          this.downloadFile(resData.submission_file, file_name);
          this.toastr.success('Submission file downloaded successfully', 'Success');
        },
        error => {
          console.log('error' + error.error);
          this.toastr.danger(error.error.detail, 'Server Error');
        },
      );
  }
   /**
   * Method which take filedata and filename, then download the file in users local system
   */
  downloadFile(file: any, filename: any) {
    const linkSource = 'data:application/pdf;base64,' + file;
    const link = document.createElement('a');
    link.href = linkSource;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }


  public fetchSubmissions(){
    
    this.gradesubmngmt_service.fetchUploads().subscribe(
      responseData => {
        // console.log('fetch response server =' + responseData);
        let data: any[];
        data = responseData;

        const extractedUploads: Upload[] = [];
        for (let i = 0; i < data.length; i++) {
            const upload = new Upload(
                i + 1,
                data[i].upload_id,
                0,
                "data:image/jpg;base64," + data[i].name_box,
                data[i].roll_no,
            );
            extractedUploads.push(upload);
        }
        
        this.uploads = extractedUploads;
        console.log(this.uploads);
        this.message = 'Total number of uploaded submissions: '+ this.uploads.length;
        // this.toastr.success('Upload data fetched successfully.', 'Success');

      },
      error => {
        console.log('error' + error);
        this.toastr.danger('server is not available', 'Server Error');
        // this.toastr.danger(error.error.detail, 'File upload Error');
      },
    );
  }
  /**
   * The method sets the component property uploadedFiles to an empty list
   */
  public clear(): void {
    this.uploadedFiles = [];
  }
  tempMessage: String = '';
  public uploadSubmissions(){

    console.log('file array len=', this.uploadedFiles.length);
    if (this.uploadedFiles.length == 0) {
      this.toastr.danger('Please upload valid submission file', 'Error');
      return;
    }
    if (this.uploadedFiles.length > 1) {
      this.toastr.danger('Upload only one submission file', 'Error');
      return;
    }
    const file: File = this.uploadedFiles[0];
    this.isLoading = true;
    this.tempMessage = this.message;
    this.message = 'The requested operation might take some time';
    this.gradesubmngmt_service.uploadBulkSubmission(this.submissionEventID, this.submissionSubeventID,
      file).subscribe(
        resData => {
          console.log('response server =' + resData);
          this.toastr.success('File uploaded successfully.', 'Success');
          this.isLoading = false;
          this.message = this.tempMessage;
          this.clear();
          this.fetchSubmissions();
          
        },
        error => {
          console.log('error' + error);
          this.toastr.danger('server is not available', 'Server Error');
          // this.toastr.danger(error.error.detail, 'File upload Error');
          this.isLoading = false;
          this.message = this.tempMessage;
        },
      );
    console.log('file uploaded');
  }

}
