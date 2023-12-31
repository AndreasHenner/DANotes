import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {Firestore, collection, doc, collectionData, onSnapshot} from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  items$; // ist ein Observable-man kann auf Veränderungen damit reagieren
  items;

  unsubList;
  unsubSingle;

  firestore: Firestore = inject(Firestore); // Firestore (Datenbank) wird in Angular eingebunden

  constructor() {
    //onSnapshot
    this.unsubList = onSnapshot(this.getNotesRef(), (list) => {
      list.forEach(element => {
        console.log(element.data());
      });
    });

    this.unsubSingle = onSnapshot(this.getSingleDocRef("notes", "sadad3sfsdgdsgf"), (element) => {
    });
    
    

//collectionData
    this.items$ = collectionData(this.getNotesRef());

    this.items = this.items$.subscribe((list) => {
      list.forEach((element) => {
        console.log(element);
      });
    })
   
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
    this.items.unsubscribe(); // beendet subscribe
    this.unsubList();
    this.unsubSingle();
  }

  // hier wird auf notes in der Datenbank zugegriffen
  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  // hier wird auf Trash in der Datenbank zugegriffen
  getTrahsRef() {
    return collection(this.firestore, 'trash');
  }

  // hier wird auf ein einzelnes Dokument in der Datenbank zugegriffen
  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
