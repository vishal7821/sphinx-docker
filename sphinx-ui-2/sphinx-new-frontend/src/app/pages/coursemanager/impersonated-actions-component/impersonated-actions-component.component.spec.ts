import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpersonatedActionsComponentComponent } from './impersonated-actions-component.component';

describe('ImpersonatedActionsComponentComponent', () => {
  let component: ImpersonatedActionsComponentComponent;
  let fixture: ComponentFixture<ImpersonatedActionsComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImpersonatedActionsComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpersonatedActionsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
