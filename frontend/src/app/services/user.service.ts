import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'General User';
  email: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Fetch all users. (Admin only)
   * @param delayMs Optional delay in milliseconds to simulate API latency
   */
  getUsers(delayMs?: number): Observable<UserProfile[]> {
    let params = new HttpParams();
    if (delayMs !== undefined && delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }
    return this.http.get<UserProfile[]>(this.apiUrl, { params });
  }

  /**
   * Create a new user. (Admin only)
   */
  createUser(userData: any, delayMs?: number): Observable<UserProfile> {
    let params = new HttpParams();
    if (delayMs !== undefined && delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }
    return this.http.post<UserProfile>(this.apiUrl, userData, { params });
  }

  /**
   * Update an existing user. (Admin only)
   */
  updateUser(id: string, userData: any, delayMs?: number): Observable<UserProfile> {
    let params = new HttpParams();
    if (delayMs !== undefined && delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }
    return this.http.put<UserProfile>(`${this.apiUrl}/${id}`, userData, { params });
  }

  /**
   * Delete a user. (Admin only)
   */
  deleteUser(id: string, delayMs?: number): Observable<{ message: string; id: string }> {
    let params = new HttpParams();
    if (delayMs !== undefined && delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }
    return this.http.delete<{ message: string; id: string }>(`${this.apiUrl}/${id}`, { params });
  }
}
