import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientFormComponent } from './Gestion-clients/client-form.component';
import { ClientService } from './service/client.service';

@NgModule({
    declarations: [
        ClientFormComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule,
        NgbDropdownModule,
        FormsModule
    ],
    providers: [ClientService],
}
)

export class AppModule { }
