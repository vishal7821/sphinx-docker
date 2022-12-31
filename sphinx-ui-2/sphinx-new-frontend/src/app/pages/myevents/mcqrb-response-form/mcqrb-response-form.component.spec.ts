import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { McqrbResponseFormComponent } from './mcqrb-response-form.component';

describe('McqrbResponseFormComponent', () => {
  let component: McqrbResponseFormComponent;
  let fixture: ComponentFixture<McqrbResponseFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ McqrbResponseFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McqrbResponseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
