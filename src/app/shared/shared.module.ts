import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReusableTableComponent } from './reusable/table/reusable-table.component'
import { ReusableToolbarComponent } from './reusable/toolbar/reusable-toolbar.component';
import { ButtonComponent } from './reusable/button/button.component'


@NgModule({
    declarations: [
        ReusableTableComponent,
        ReusableToolbarComponent,
        ButtonComponent],
    exports: [
        ReusableTableComponent,
        ReusableToolbarComponent],
    imports: [CommonModule,
    ]
})
export class SharedModule { }