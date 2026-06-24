import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCreditos } from './listar-creditos';

describe('ListarCreditos', () => {
  let component: ListarCreditos;
  let fixture: ComponentFixture<ListarCreditos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarCreditos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarCreditos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
