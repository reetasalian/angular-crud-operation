import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client } from '../models/client';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class DataService {
  private URL = '../../assets/data.json';

  dataChange: BehaviorSubject<Client[]> = new BehaviorSubject<Client[]>([]);

  // Temporarily stores data from dialogs
  dialogData: any;

  constructor(private httpClient: HttpClient) {}

  get data(): Client[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  getAllClients(): void {
    this.httpClient.get<Client[]>(this.URL).subscribe(
      (data) => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      }
    );
  }

  addClient(client: Client): void {
    this.dialogData = client;
  }

  updateClient(client: Client): void {
    this.dialogData = client;
  }

  deleteClient(name: string): void {
    console.log(`Client ${name} is deleted!!`);
  }
}
