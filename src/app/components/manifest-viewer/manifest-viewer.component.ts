import { LocalStorageService } from './../../util/local-storage.service';
import { NotificationService } from './../../api/notification.service';
import { HelperService } from './../../api/helper.service';
import { ConnectServer } from './../../api/connect-server';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Inject, Optional, OnDestroy } from '@angular/core';
import { MatBottomSheetRef, MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import * as uuid from 'uuid';

@Component({
  selector: 'app-manifest-viewer',
  templateUrl: './manifest-viewer.component.html',
  styleUrls: ['./manifest-viewer.component.css']
})
export class ManifestViewerComponent implements OnInit {

  color = '#7EC636';
  loaderId = uuid.v4();
  isBottomSheet = false;
  pdfSrc = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bottomSheetRef: MatBottomSheet,
    private api: ConnectServer,
    private localStorageService: LocalStorageService,
    private helperService: HelperService,
    private notificationService: NotificationService,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    this.isBottomSheet = data != null;

  }

  ngOnInit() {
    this.helperService.startLoader(this.loaderId);
    console.log(this.data);
    if (this.data) {
      this.getPdfFile(this.data.key, false);
    }
    this.route.params
      .subscribe((params: Params) => {
        console.log('params', params);
        if (params.key) {
          this.getPdfFile(params.key, params.isRepository === 'true');
        }
      });
  }

  getPdfFile(key: string, isRepository: boolean) {
    console.log('keeey', key, isRepository);
    if (this.localStorageService.exist(key)) {
      this.pdfSrc = this.localStorageService.get(key);
    } else {
      this.api.getPDFUri(key, this.loaderId, isRepository).subscribe(data => {
        this.pdfSrc = data.url;
      });
    }
  }

  openInUrl() {
    this.bottomSheetRef.dismiss();
    this.router.navigate(['/manifest/manifest-viewer', { key: this.data.key, isRepository: false }]);
  }

  close() {
    this.bottomSheetRef.dismiss();
  }

  afterLoadPdf() {
    // console.log('finish pdf');
    this.helperService.stopLoader(this.loaderId);
  }

  onError(error: any) {
    // do anything
    this.helperService.stopLoader(this.loaderId);
    this.notificationService.showError('Error', 'No se pudo cargar el archivo ' + error);
  }
}
