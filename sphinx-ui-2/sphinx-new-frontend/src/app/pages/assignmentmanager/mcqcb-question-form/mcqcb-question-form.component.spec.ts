import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { McqcbQuestionFormComponent } from './mcqcb-question-form.component';

describe('McqcbQuestionFormComponent', () => {
  let component: McqcbQuestionFormComponent;
  let fixture: ComponentFixture<McqcbQuestionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ McqcbQuestionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McqcbQuestionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
