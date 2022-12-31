import { Component, OnInit } from '@angular/core';
import { McqrbResponseForm } from "./mcqrb-response-form.model";
import { MyEventsService } from '../myevents.service';

@Component({
  selector: 'mcqrb-response-form',
  templateUrl: './mcqrb-response-form.component.html',
  styleUrls: ['./mcqrb-response-form.component.scss']
})
export class McqrbResponseFormComponent implements OnInit {
  mcqrbresponseform = new McqrbResponseForm("","","");
  dataarray = [];
  optionDataMCQRB: any;
  constructor(
    public myEventsService: MyEventsService,
  ) { }

  ngOnInit() {
    this.mcqrbresponseform = new McqrbResponseForm("","","");
    this.dataarray.push(this.mcqrbresponseform);
    this.myEventsService.optionDataMCQRB.subscribe(obj => {
      this.dataarray = [];  
      let currentEvent = JSON.parse(localStorage.getItem('currentEvent'));
      let index = JSON.parse(localStorage.getItem('currentIndexOfQuestion'));
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
          this.dataarray.push(new McqrbResponseForm(obj[i].labelText,text,obj[i].is_Correct));
        } 
      }
      else {
        this.dataarray.push(new McqrbResponseForm("","",""));
      }
      this.getData();
    });
  }


  setIsCorrect(index) { 
    
    this.dataarray[index]['is_Correct'] = true;
    for ( let i = 0; i < this.dataarray.length; i++ ) {
      if ( i != index ) {
        this.dataarray[i]['is_Correct'] = false;
      }
    }
    localStorage.setItem('response', (index));
    return this.dataarray;
  }

  getData(){
    let index = -1;
    for ( let i = 0; i < this.dataarray.length; i++ ) {
        if ( this.dataarray[i]['is_Correct'] != false ) {
          index = i;
        }
    }
    localStorage.setItem('response', JSON.stringify(index));
    return this.dataarray;
  }

  

}
