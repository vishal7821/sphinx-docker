import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { McqcbResponseFormComponent } from './mcqcb-response-form.component';

describe('McqcbResponseFormComponent', () => {
  let component: McqcbResponseFormComponent;
  let fixture: ComponentFixture<McqcbResponseFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ McqcbResponseFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McqcbResponseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
