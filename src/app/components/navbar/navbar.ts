import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  searchResults: string[] = [];
  searchTerm: string = '';

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.performSearch(term))
    ).subscribe(results => {
      this.searchResults = results;
    });
  }

  private performSearch(term: string) {
    if (!term.trim()) {
      return [];
    }

    const url = `http://127.0.0.1:8000/search/${term}`;
    return this.http.get<{ matches: string[] }>(url).pipe(
      map(response => response.matches)
    );
  }

  onSearchTermChanged(term: string): void {
    this.searchSubject.next(term);
  }

  selectResult(result: string): void {
    this.searchTerm = result;
    this.searchResults = [];
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}