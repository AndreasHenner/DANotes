import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc} from '@angular/fire/firestore';

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

  // löschen von Notes -- cruD
  async deleteNote(colId: "notes" | "trash", docId: string) {
   await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
    (err) => { console.log(err)}
   );
  }


  // Updaten(editieren) der Notes -- cr U d
  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch((err) => {
        console.log(err);
      });
    }
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes';
    } else {
      return 'trash';
    }
  }

  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  // hinzufügen einer Note -- Crud
  async addNote(item: Note, colId: "notes" | "trash") {
    if (colId == "notes") {
      await addDoc(this.getNotesRef(), item);
    } else {
      await addDoc(this.getTrashRef(), item).catch((err) => {
        console.error(err);
    }).then((docRef) => {
        console.log('Document written with ID: ', docRef?.id);
      });
    }
    }
  

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      title: obj.title || '',
      type: obj.type || 'note',
      content: obj.content || '',
      marked: obj.marked || false,
    };
  }

  ngonDestroy() {
    this.unsubTrash();
    this.unsubNotes();
  }


  // read Notes -- c R ud
  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
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
