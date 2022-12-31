import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaingradeInteractiveManagerComponent } from './maingrade-interactive-manager.component';

describe('MaingradeInteractiveManagerComponent', () => {
  let component: MaingradeInteractiveManagerComponent;
  let fixture: ComponentFixture<MaingradeInteractiveManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaingradeInteractiveManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaingradeInteractiveManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
