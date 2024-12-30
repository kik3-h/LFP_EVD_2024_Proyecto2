import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Fronted Proyecto 2';
  inputText: string = '';
  analysisResult: any;

  constructor(private apiService: ApiService) {}

  analyzeText() {
    this.apiService.analyzeText(this.inputText).subscribe(
      (result: any) => {
        this.analysisResult = result;
      },
      (error: any) => {
        console.error('Error analyzing text:', error);
      }
    );
  }
}
