import { Component, OnInit } from '@angular/core';
import { NbWindowRef } from '@nebular/theme';

@Component({
  selector: 'roaster-form',
  templateUrl: './roaster-form.component.html',
  styleUrls: ['./roaster-form.component.scss'],
})
export class RoasterFormComponent implements OnInit {

  constructor(public windowRef: NbWindowRef) { }

  ngOnInit() {
  }

  public uploadedFiles: Array<File> = [];

  public clear(): void {
      this.uploadedFiles = [];
  }

  close() {
    this.windowRef.close();
  }
}
