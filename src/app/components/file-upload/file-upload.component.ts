import { NotificationService } from './../../api/notification.service';
import { UploadService } from './../../api/upload/upload.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  @ViewChild('fileInput', {static: true}) fileInput;
  public files: Set<File> = new Set();

  progress;
  canBeClosed = true;
  primaryButtonText = 'Upload';
  showCancelButton = true;
  uploading = false;
  uploadSuccessful = false;
  constructor(public uploadService: UploadService,
              private notificationservice: NotificationService) { }

  ngOnInit() {
    // this.notificationservice.showSuccess("safdas", "dvfds");
    // this.notificationservice.showCustom();
  }

  uploadFile(event) {
    this.addFiles(event);
  }
  onThumbnailSelected(event) {
    this.addFiles(event);
  }

  addFiles(event: Event) {
    if (this.uploading){ return; } else {
      this.notificationservice.showInfo('Informaciòn', 'Espera a que los archivos seleccionados sean subidos');
    }

    // console.log('uploadFile', event, this.fileInput);
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    // console.log('files', files);
    for (const key in files) {
      if (!isNaN(parseInt(key))) {
        this.files.add(files[key]);
      }
    }
    // console.log('files ---', files);

    this.uploadFiles();
  }

  uploadFiles() {
    // if everything was uploaded already, just close the dialog
    if (this.uploadSuccessful) {
      console.log('It is already to close');
      // return this.dialogRef.close();
    }

    // set the component state to "uploading"
    this.uploading = true;

    // start the upload and save the progress map
    this.progress = this.uploadService.upload(this.files);
    // console.log(this.progress);
    // convert the progress map into an array
    const allProgressObservables = [];

    // tslint:disable-next-line: forin
    for (const key in this.progress) {
      allProgressObservables.push(this.progress[key].progress);
      // this.progress[key].progress.subscribe({
      //   next(num) { console.log(num); },
      //   complete() {
      //     console.log('Finished sequence progress');
      //   }
      // });
      // this.progress[key].isFinish.subscribe({
      //   next(isFinish) { console.log(isFinish); },
      //   complete() { console.log('Finished sequence isFinish'); }
      // });
    }

    // The OK-button should have the text "Finish" now
    this.primaryButtonText = 'Finish';

    // The dialog should not be closed while uploading
    this.canBeClosed = false;
    // this.dialogRef.disableClose = true;

    // Hide the cancel-button
    this.showCancelButton = false;

    // When all progress-observables are completed...
    forkJoin(allProgressObservables).subscribe(end => {
      // ... the dialog can be closed again...
      this.canBeClosed = true;
      // this.dialogRef.disableClose = false;

      // ... the upload was successful...
      this.uploadSuccessful = true;
      this.files.clear();
      // ... and the component is no longer uploading
      this.uploading = false;
    });
  }
}
