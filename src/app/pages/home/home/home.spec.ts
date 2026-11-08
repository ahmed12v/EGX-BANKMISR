import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StorageService } from '../../../admin/service/storgeService';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: StorageService, useValue: { getItem: () => ({ UserName: ' test person ' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('shows the signed-in name next to Sign out', () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
    const account = (fixture.nativeElement as HTMLElement).querySelector('.portal-account');
    expect(account?.querySelector('.portal-user-name')?.textContent?.trim()).toBe('test person');
    expect(account?.querySelector('[aria-label="Sign out"]')).not.toBeNull();
  });
});
