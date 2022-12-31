import { Component, OnInit } from '@angular/core';
import { MyEventsService } from '../../myevents.service';
import { NbToastrService } from '@nebular/theme';
import { PageRouterService } from '../../../page-router.service';
import { AutoGradingCluster, AutoGradingDuty, AutoRowGDs } from '../../myevents.model';

@Component({
  selector: 'autograde',
  templateUrl: './autograde.component.html',
  styleUrls: ['./autograde.component.scss']
})
export class AutogradeComponent implements OnInit {


  isLoading : boolean = false;
  isGradeLoading : boolean = false;
  eventId: number = -1;
  subEventId: number = -1;
  questionId: number = -1;
  clusterData: AutoGradingCluster[]=[];
  message: string = 'Generate the clusters of answer from submissions based on similarity';
  constructor(
        // private router: Router,
        public myEventsService: MyEventsService,
        private toastr: NbToastrService,
        private pageRouter: PageRouterService,
  ) { }

  ngOnInit() {
    this.eventId = +(localStorage.getItem('myGradingEventID'));
    this.subEventId = +(localStorage.getItem('myGradingSubEventID'));
    this.questionId = +(localStorage.getItem('autoGradeQID'));
  
  }

  onGradeClusters(){
    if(this.clusterData.length==0){
      this.toastr.primary('Please generate and verify the clusters', 'Warning');
      return;
    }
    let gd_ids:any[]=[];
    let subquestion_ids:any[]=[];
    let rec_chars:any[]=[];
    for(let i=0; i<this.clusterData.length; i++){
      const auto_gds: AutoGradingDuty[] =this.clusterData[i].auto_GDs;
      for(let j=0; j< auto_gds.length;j++){
       
        gd_ids.push(auto_gds[j].gd_id);
        subquestion_ids.push(auto_gds[j].subquestion_id);
        rec_chars.push(auto_gds[j].predicted_char);
      }
    }
    this.myEventsService.submitAutoGradingDuties(this.eventId,this.subEventId,this.questionId
      ,gd_ids, subquestion_ids, rec_chars).subscribe(
        resData => {
          console.log(resData);
          this.toastr.success('Clusters Graded successfully', 'Success');
          this.gotoGradingManager();
        },
        error => {
          console.log(error);
          this.toastr.danger('Server error', 'Error');
        }
      );
  }

  gotoGradingManager(){
    this.pageRouter.gotoGradingManager();
  }


  onAutoGrade(){
    this.isLoading = true;
    this.myEventsService.getAutoGradingDuties(this.eventId, this.subEventId, this.questionId).subscribe(
      resData => {
        this.clusterData = [];
        console.log(resData);
        let data:any[] = resData;

        for(let i=0;i<data.length; i++){
          let label = 'Cluster '+(i+1);
          
          let auto_gds: AutoGradingDuty[]=[];
          let row_gds: AutoGradingDuty[] = [];
          
          for(let j=0; j<data[i].length; j++){

            const gd: AutoGradingDuty = new AutoGradingDuty(
              j,
              data[i][j].gd_id,
              data[i][j].subquestion_id,
              data[i][j].predicted_label,
              data[i][j].predicted_char,
              data[i][j].confidence,
              "data:image/jpg;base64," +data[i][j].img
            )
            auto_gds.push(gd);
            
            
          }
          
          const cluster:AutoGradingCluster = new AutoGradingCluster(
            i,
            label,
            auto_gds
          );
         
          this.clusterData.push(cluster);
        }
        

        this.message = "Verify and submit the below cluster data to grade the submissions";
        this.isLoading= false;
        this.toastr.success('Clusters generated successfully', 'Success');
      },
      error => {
        this.isLoading= false;
        console.log(error);
      },
    );
  }


}
