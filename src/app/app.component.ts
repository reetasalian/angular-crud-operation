import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from './services/data.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Client } from './models/client';
import { DataSource } from '@angular/cdk/collections';
import { AddDialogComponent } from './dialogs/add/add.dialog.component';
import { EditDialogComponent } from './dialogs/edit/edit.dialog.component';
import { DeleteDialogComponent } from './dialogs/delete/delete.dialog.component';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  displayedColumns = ['name', 'email', 'phone_no', 'actions'];
  clientDatabase: DataService | null;
  dataSource: UpdateDataSource | null;
  index: number;
  name: string;
  clientCount: number;

  constructor(
    public httpClient: HttpClient,
    public dialogService: MatDialog,
    public dataService: DataService
  ) {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  ngOnInit() {
    this.fetchAllClients();
    this.dataService.getAllClients();
    this.dataService.dataChange.subscribe((response) => {
      this.clientCount = response.length;
    });
  }

  reload() {
    this.fetchAllClients();
  }

  openAddDialog() {
    const dialogRef = this.dialogService.open(AddDialogComponent, {
      data: { client: {} },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // insert new row inside DataService
        this.clientDatabase.dataChange.value.push(
          this.dataService.getDialogData()
        );
        this.refreshTable();
        this.clientCount = this.clientDatabase.data.length;
      }
    });
  }

  startEdit(i: number, name: string, email: string, phone_no: string) {
    this.name = name;
    this.index = i;
    console.log(this.index);
    const dialogRef = this.dialogService.open(EditDialogComponent, {
      data: {
        name: name,
        email: email,
        phone_no: phone_no,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('edit dialog closed -', result);
      if (result) {
        //In case of edit, firstly we will search client data by name
        const foundIndex = this.clientDatabase.dataChange.value.findIndex(
          (x) => x.name === this.name
        );

        this.clientDatabase.dataChange.value[foundIndex] =
          this.dataService.getDialogData();
        this.refreshTable();
        this.clientCount = this.clientDatabase.data.length;
      }
    });
  }

  deleteItem(i: number, name: string, email: string, phone_no: string) {
    this.index = i;
    this.name = name;
    const dialogRef = this.dialogService.open(DeleteDialogComponent, {
      data: {
        name: name,
        email: email,
        phone_no: phone_no,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        const foundIndex = this.clientDatabase.dataChange.value.findIndex(
          (x) => x.name === this.name
        );
        this.clientDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
        this.clientCount = this.clientDatabase.data.length;
      }
    });
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  public fetchAllClients() {
    this.clientDatabase = new DataService(this.httpClient);

    this.dataSource = new UpdateDataSource(
      this.clientDatabase,
      this.paginator,
      this.sort
    );
    fromEvent(this.filter.nativeElement, 'keyup').subscribe(() => {
      if (!this.dataSource) {
        return;
      }
      this.dataSource.filter = this.filter.nativeElement.value;
    });
  }
}

export class UpdateDataSource extends DataSource<Client> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Client[] = [];
  renderedData: Client[] = [];

  constructor(
    public _clientDB: DataService,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  connect(): Observable<Client[]> {
    const displayDataChanges = [
      this._clientDB.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];

    this._clientDB.getAllClients();

    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this._clientDB.data
          .slice()
          .filter((client: Client) => {
            const searchStr = client.name.toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });

        const sortedData = this.sortData(this.filteredData.slice());

        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this._paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }

  disconnect() {}

  /** Returns a sorted copy of the database data. */
  sortData(data: Client[]): Client[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'name':
          [propertyA, propertyB] = [a.name, b.name];
          break;
        case 'email':
          [propertyA, propertyB] = [a.email, b.email];
          break;
        case 'phone_no':
          [propertyA, propertyB] = [a.phone_no, b.phone_no];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
