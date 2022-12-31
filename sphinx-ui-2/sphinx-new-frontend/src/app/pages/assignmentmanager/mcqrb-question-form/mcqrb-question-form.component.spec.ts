import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { McqrbQuestionFormComponent } from './mcqrb-question-form.component';

describe('McqrbQuestionFormComponent', () => {
  let component: McqrbQuestionFormComponent;
  let fixture: ComponentFixture<McqrbQuestionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ McqrbQuestionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McqrbQuestionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
