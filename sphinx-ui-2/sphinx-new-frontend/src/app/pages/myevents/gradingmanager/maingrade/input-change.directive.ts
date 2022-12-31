
import { Directive, EventEmitter, Input, OnDestroy, OnInit, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[inputChange]'
})
export class InputChangeDirective {

  @Input('inputChange') emitter: EventEmitter<any>;
  private subscription: Subscription;
  
  constructor(@Self() private ngControl: NgControl) {
    this.emitter = new EventEmitter();
  }
  
  ngOnInit() {
    this.subscription = this.ngControl.valueChanges
      .subscribe(data => this.emitter.emit(data));
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

