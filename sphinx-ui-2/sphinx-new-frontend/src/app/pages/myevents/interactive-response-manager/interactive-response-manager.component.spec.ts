import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveResponseManagerComponent } from './interactive-response-manager.component';

describe('InteractiveResponseManagerComponent', () => {
  let component: InteractiveResponseManagerComponent;
  let fixture: ComponentFixture<InteractiveResponseManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractiveResponseManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveResponseManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
