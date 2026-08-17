import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinneLloading } from './spinne-lloading';

describe('SpinneLloading', () => {
  let component: SpinneLloading;
  let fixture: ComponentFixture<SpinneLloading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinneLloading],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinneLloading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
