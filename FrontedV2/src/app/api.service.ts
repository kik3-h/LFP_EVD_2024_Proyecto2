import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/analizar-html'; // URL de tu API

  constructor(private http: HttpClient) {}

  analyzeText(text: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, text, { headers: { 'Content-Type': 'text/plain' } });
  }
  
}
