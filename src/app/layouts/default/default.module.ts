import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from './../../shared/shared.module';
import { UsersModule } from '../../modules/users/users.module';
import { CoreModule } from '../../modules/core/core.module';

import { DefaultComponent } from './default.component';
import { HomeComponent } from '../../modules/home/home.component';


@NgModule({
  declarations: [DefaultComponent, HomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    ReactiveFormsModule,
    UsersModule,
    CoreModule,
  ],
})
export class DefaultModule {}
