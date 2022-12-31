
FROM python:3.6

ENV PYTHONUNBUFFERED 1

RUN mkdir /code

WORKDIR /code

COPY requirements.txt /code/

RUN pip3 install -r requirements.txt
RUN apt-get update
RUN apt-get install poppler-utils -y
RUN apt-get install ffmpeg libsm6 libxext6  -y

COPY . /code

EXPOSE 8000

CMD python3 manage.py runserver 0.0.0.0:8000
