import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleRetiroPage } from './detalle-retiro-historial.page';

describe('DetalleRetiroPage', () => {
  let component: DetalleRetiroPage;
  let fixture: ComponentFixture<DetalleRetiroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleRetiroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
