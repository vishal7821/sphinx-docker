import { Component, OnInit } from '@angular/core';
import { McqcbResponseForm } from "./mcqcb-response-form.model";
import { MyEventsService } from '../myevents.service';

@Component({
  selector: 'mcqcb-response-form',
  templateUrl: './mcqcb-response-form.component.html',
  styleUrls: ['./mcqcb-response-form.component.scss']
})
export class McqcbResponseFormComponent implements OnInit {

  mcqcbresponseform = new McqcbResponseForm("","","");
  dataarray = [];
  optionsData: any;
  constructor(
    public myEventsService: MyEventsService,
  ) { }

  ngOnInit() {
    // this.mcqcbresponseform = new McqcbResponseForm("","","");
    // this.dataarray.push(this.mcqcbresponseform);
    this.myEventsService.optionData.subscribe(obj => {
      this.dataarray = [];  
      let currentEvent = JSON.parse(localStorage.getItem('currentEvent'));
      let index = JSON.parse(localStorage.getItem('currentIndexOfQuestion')) || 0;
      let questionsData = currentEvent.questionSets[0].questions;
      let currentQuestion = questionsData[index];
      const questions_data = currentQuestion;
      if ( questions_data.options ) {
        let optionsCount = JSON.parse(atob(questions_data.options)).length;
        for ( let i = 0; i < optionsCount; i++ ) {
          var html = obj[i].optionText;
          var div = document.createElement("div");
          div.innerHTML = html;
          var text = div.textContent || div.innerText || "";
          this.dataarray.push(new McqcbResponseForm(obj[i].labelText,obj[i].optionText,obj[i].is_Correct));
        } 
      }
      else {
        this.dataarray.push(new McqcbResponseForm("","",""));
      }
      this.getData();
    });
}

setResponse(index) {
  let responseString = "";
  for ( let i = 0; i < this.dataarray.length; i++ ) {
    if ( this.dataarray[i].is_Correct) {
      responseString = responseString + i;
    }
  }
  localStorage.setItem('response', JSON.stringify(responseString));
  
}

getData() {
  let responseString = "";
  for ( let i = 0; i < this.dataarray.length; i++ ) {
    if ( this.dataarray[i].is_Correct) {
      responseString = responseString + i;
    }
  }
  localStorage.setItem('response', JSON.stringify(responseString));
  
}




}