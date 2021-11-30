import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { data } from 'src/app/main/interface/busqueda.interface';
import { ModalComponent } from 'src/app/main/modal/modal.component';

@Component({
	selector: 'reusable-table',
	templateUrl: './reusable-table.component.html',
	styleUrls: ['./reusable-table.component.scss']
})
export class ReusableTableComponent implements OnInit {

	public pageIndex = 1;
	public beforePageIndex = 0;
	public indexIndicator: number[] = [];
	public auxData: any[] = [];
	@Input() data: any[] = [];
	@Input() dataChange!: Observable<any>;
	@Input() dataSource!: string
	@Input() columns: any = [];
	@Input() filters: any = [];
	@Input() defaults: any = [];
	@Input() paginator = true;
	@Input() resultLength = 0;
	@Input() typeLicense = 'admin';
	@Input() action = true;
	@Output() returnActions = new EventEmitter();
	@Output() returnData = new EventEmitter();
	@Output() returnModal = new EventEmitter();
	@Output() returnSortable = new EventEmitter();

	constructor(private router: Router, private modalService: NgbModal) { }


	ngOnInit() {
		this.columns = this.columns;
		this.buildIndexPaginado();
	}
	ngOnChanges() {
		if (this.dataChange) {
			this.dataChange.subscribe((res: any) => {
				console.log(res);
				this.data = res;
				this.buildIndexPaginado();
			});
		}
	}

	detail(dataid: any) {

		if (dataid.gcbaLicenseStatus == "ENTERED") {
			const modalRef = this.modalService.open(ModalComponent);
			modalRef.componentInstance.detalle = dataid;
		}else{
			alert("EL REGISTRO DEBE ESTAR APROBADO")
		}
		console.log(dataid);
	}


	// Paginado

	buildIndexPaginado() {
		let value = this.resultLength;
		if (this.paginator) { // pregunto si el paginado lo hace el Front o back
			value = this.data.length;
		}
		if (value > 10 && value <= 20) {
			this.indexIndicator = [1, 2];
		} else if (value > 20 && value <= 30) {
			this.indexIndicator = [1, 2, 3];
		} else if (value > 30) {
			this.indexIndicator = [1, 2, 3, 4];
		}
	}


	customIndex(customIndex: number) {
		this.pageIndex = customIndex;
		this.beforePageIndex = (this.pageIndex * 10) - 10;
	}

	sortable(column: any) {
		const direction = (column.split(',')[1] === '' || column.split(',')[1] === 'desc') ? 'desc' : 'asc';
		const orderBy = `${column},${direction}`;
		this.returnSortable.emit(orderBy);
	}



}
