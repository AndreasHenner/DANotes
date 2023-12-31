import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {Firestore, collection, doc, collectionData, onSnapshot} from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];


  unsubTrash;
  unsubNotes;

  firestore: Firestore = inject(Firestore); // Firestore (Datenbank) wird in Angular eingebunden

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
  }

  setNoteObject(obj: any, id: string): Note {
  return{
  id: id,
  type: obj.type || "note",
  title: obj.title || "",
  content: obj.content || "",
  marked: obj.marked || false,
}
  }

  ngonDestroy() {
    this.unsubTrash();
    this.unsubNotes();
  }

  subTrashList() {
   return onSnapshot(this.getTrashRef(), (list) => {
    this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
        console.log(this.setNoteObject(element.data(), element.id));
        console.log(element.data());
      });
    });
  }

  // hier wird auf notes in der Datenbank zugegriffen
  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  // hier wird auf Trash in der Datenbank zugegriffen
  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  // hier wird auf ein einzelnes Dokument in der Datenbank zugegriffen
  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
