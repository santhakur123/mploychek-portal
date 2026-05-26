import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VerificationRecord {
  id: string;
  candidateName: string;
  userId: string;
  type: string;
  status: 'Pending' | 'Verified' | 'Flagged' | 'In Progress';
  riskLevel: 'Low' | 'Medium' | 'High';
  submittedDate: string;
  verifiedDate: string | null;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private apiUrl = '/api/records';

  constructor(private http: HttpClient) {}

  /**
   * Fetch background check records.
   * Admins get all records; General Users get only their own records.
   * @param delayMs Optional delay in milliseconds to simulate API latency
   */
  getRecords(delayMs?: number): Observable<VerificationRecord[]> {
    let params = new HttpParams();
    if (delayMs !== undefined && delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }
    return this.http.get<VerificationRecord[]>(this.apiUrl, { params });
  }

  /**
   * Request a new verification check.
   */
  createRecord(recordData: Partial<VerificationRecord>, delayMs?: number): Observable<VerificationRecord> {
    let params = new HttpParams();
    if (delayMs !== undefined && delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }
    return this.http.post<VerificationRecord>(this.apiUrl, recordData, { params });
  }
}
