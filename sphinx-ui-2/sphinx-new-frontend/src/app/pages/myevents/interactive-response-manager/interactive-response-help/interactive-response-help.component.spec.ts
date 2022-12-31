import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveResponseHelpComponent } from './interactive-response-help.component';

describe('InteractiveResponseHelpComponent', () => {
  let component: InteractiveResponseHelpComponent;
  let fixture: ComponentFixture<InteractiveResponseHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractiveResponseHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveResponseHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
