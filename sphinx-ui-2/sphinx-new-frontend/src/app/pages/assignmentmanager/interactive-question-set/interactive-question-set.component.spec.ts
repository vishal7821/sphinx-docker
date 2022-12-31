import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveQuestionSetComponent } from './interactive-question-set.component';

describe('InteractiveQuestionSetComponent', () => {
  let component: InteractiveQuestionSetComponent;
  let fixture: ComponentFixture<InteractiveQuestionSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractiveQuestionSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveQuestionSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
