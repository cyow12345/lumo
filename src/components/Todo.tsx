import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Todo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faBolt, faLeaf, faCheck, faCalendarAlt, faFlag, faCheckCircle, faCircle, faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { UserType } from "../interfaces/todoContext";
import Card from './Card';
import { CheckSquare, Calendar, Flame, Zap, Leaf, Plus, X, Check, Filter, RotateCcw, Trash2 } from 'lucide-react';

// Interface für den User-Typ
interface User {
  id: string;
  email?: string;
}

// Interface für Datenbank-Elemente
interface TodoDBItem {
  id: string;
  task?: string;
  text?: string;
  is_completed?: boolean;
  completed?: boolean;
  created_at?: string;
  due_date?: string;
  dueDate?: string;
  priority?: 'hoch' | 'mittel' | 'niedrig';
  user_id?: string;
  [key: string]: any; // Zusätzliche Eigenschaften erlauben
}

// Interface für ein einzelnes Todo-Item
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  created_at?: string;
  dueDate?: string;
  priority?: 'hoch' | 'mittel' | 'niedrig';
  user_id?: string;
}

// Props für die Todo-Komponente
interface TodoProps {
  user?: UserType;
  isGuest?: boolean;
  selectedCategory?: string;
}

// Filter-Typen
type FilterType = 'alle' | 'aktiv' | 'erledigt';

const Todo: React.FC<TodoProps> = ({ user, isGuest = false, selectedCategory }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('alle');
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoItem['priority']>('mittel');
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<'hoch' | 'mittel' | 'niedrig'>('mittel');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Nutzer-ID sicherstellen, Fallback auf 'guest'
  const userId = user?.id || 'guest';

  // Todos aus dem localStorage laden, wenn die Komponente gemountet wird
  useEffect(() => {
    fetchTodos();
    
    // Lade Nutzername aus den Benutzerdaten
    const userData = localStorage.getItem(`user_${userId}`);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || 'Benutzer');
      } catch (e) {
        console.error('Fehler beim Laden der Nutzerdaten:', e);
        setUserName('Benutzer');
      }
    } else {
      // Fallback, wenn keine Nutzerdaten verfügbar sind
      setUserName(userId === 'guest' ? 'Gast' : 'Benutzer');
    }
  }, [userId]);

  // Todos im localStorage speichern, wenn sie sich ändern
  useEffect(() => {
    localStorage.setItem(`todos_${userId}`, JSON.stringify(todos));
  }, [todos, userId]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Konvertiere Datenbankfelder auf lokale Feldnamen
        const formattedData = data.map((item: TodoDBItem) => ({
          id: item.id,
          text: item.task || item.text || '', // Unterstütze beide Felder
          completed: item.is_completed || item.completed || false, // Unterstütze beide Felder
          created_at: item.created_at,
          dueDate: item.due_date || item.dueDate,
          priority: item.priority || 'mittel',
          user_id: item.user_id
        }));
        setTodos(formattedData);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Todos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Neues Todo hinzufügen
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = newTodoText.trim();
    
    if (!trimmedText) {
      // Zeige Fehlermeldung an, wenn das Todo leer ist
      setError('Bitte gib einen Text für dein Todo ein');
      return;
    }
    
    setError(null);
    try {
      // Sichere User-ID verwenden
      let currentUserId = userId;
      
      // Versuche, den echten Benutzer zu bekommen, falls vorhanden
      try {
        const userResponse = await supabase.auth.getUser();
        if (userResponse.data?.user?.id) {
          currentUserId = userResponse.data.user.id;
        }
      } catch (authError) {
        console.error('Authentifizierungsfehler, verwende Fallback-ID:', authError);
      }
      
      // Verwende Datenbankfeldnamen für neue Einträge
      const newTodoItem = {
        task: trimmedText,
        is_completed: false,
        due_date: newTodoDueDate || null,
        priority: newTodoPriority,
        user_id: currentUserId
      };

      const { data, error } = await supabase
        .from('todos')
        .insert([newTodoItem])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        // Konvertiere die zurückgegebenen Daten in das lokale Format
        const formattedData = data.map((item: TodoDBItem) => ({
          id: item.id,
          text: item.task || item.text || '',
          completed: item.is_completed || item.completed || false,
          created_at: item.created_at,
          dueDate: item.due_date || item.dueDate,
          priority: item.priority || 'mittel',
          user_id: item.user_id
        }));
        
        setTodos([...formattedData, ...todos]);
        setNewTodoText('');
        setNewTodoDueDate('');
        setNewTodoPriority('mittel');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Todos:', error);
    }
  };

  // Todo-Status umschalten (erledigt/nicht erledigt)
  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      // Verwende Datenbankfeldnamen für Updates
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !completed })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Todos:', error);
    }
  };

  // Todo löschen
  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen des Todos:', error);
    }
  };

  // Erledigte Todos entfernen
  const clearCompleted = useCallback(() => {
    const newTodos = todos.filter(todo => !todo.completed);
    setTodos(newTodos);
    localStorage.setItem("todos", JSON.stringify(newTodos));
  }, [todos]);

  // Funktion zum Filtern der Todos basierend auf dem aktuellen Filter
  const getFilteredTodos = useCallback(() => {
    switch (currentFilter) {
      case 'aktiv':
        return todos.filter(todo => !todo.completed);
      case 'erledigt':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, currentFilter]);

  // Todos nach dem aktuellen Filter filtern
  const filteredTodos = getFilteredTodos();

  // Anzahl der aktiven und erledigten Todos
  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  // Teilen-Funktion für Todos
  const shareTodos = (method: 'email' | 'copy' | 'download') => {
    const todosList = todos
      .map(todo => `- [${todo.completed ? 'x' : ' '}] ${todo.text}`)
      .join('\n');
    
    const todoText = `${userName}'s Todo Liste:\n\n${todosList}`;
    
    switch (method) {
      case 'email':
        window.location.href = `mailto:?subject=Meine Todo Liste&body=${encodeURIComponent(todoText)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(todoText).then(
          () => {
            alert('Todo Liste wurde in die Zwischenablage kopiert!');
          },
          () => {
            alert('Fehler beim Kopieren in die Zwischenablage');
          }
        );
        break;
      case 'download':
        const element = document.createElement('a');
        const file = new Blob([todoText], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = 'todo_liste.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        break;
    }
    
    setShowShareOptions(false);
  };

  // Formatieren des Datums
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Prüfen, ob ein Datum überfällig ist
  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  // Gibt CSS-Klasse basierend auf der Priorität zurück
  const getPriorityClass = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'hoch':
        return 'priority-high';
      case 'mittel':
        return 'priority-medium';
      case 'niedrig':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  // Icon basierend auf der Priorität zurückgeben
  const getPriorityIcon = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'hoch':
        return <FontAwesomeIcon icon={faFire} className="mr-1" />;
      case 'mittel':
        return <FontAwesomeIcon icon={faBolt} className="mr-1" />;
      case 'niedrig':
        return <FontAwesomeIcon icon={faLeaf} className="mr-1" />;
      default:
        return <FontAwesomeIcon icon={faFlag} className="mr-1" />;
    }
  };

  // Alle Todos umschalten (erledigt/nicht erledigt)
  const toggleAllTodos = async () => {
    const areAllCompleted = todos.every(todo => todo.completed);
    const newStatus = !areAllCompleted;
    
    try {
      // Aktualisiere alle Todos in der Datenbank
      for (const todo of todos) {
        const { error } = await supabase
          .from('todos')
          .update({ is_completed: newStatus })
          .eq('id', todo.id);
          
        if (error) {
          console.error('Fehler beim Umschalten des Todo-Status:', error);
        }
      }
      
      // Aktualisiere den lokalen State
      setTodos(todos.map(todo => ({
        ...todo,
        completed: newStatus
      })));
    } catch (error) {
      console.error('Fehler beim Umschalten aller Todos:', error);
    }
  };

  // Erledigte Todos löschen
  const deleteCompletedTodos = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    
    try {
      for (const todo of completedTodos) {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', todo.id);
          
        if (error) {
          console.error('Fehler beim Löschen der erledigten Todos:', error);
        }
      }
      
      setTodos(todos.filter(todo => !todo.completed));
    } catch (error) {
      console.error('Fehler beim Löschen der erledigten Todos:', error);
    }
  };

  // Render für die Komponente
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-midnight flex items-center">
          <CheckSquare className="mr-2 text-lavender" /> Meine Aufgaben
        </h1>
        
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
          <button 
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition-colors ${currentFilter === 'alle' ? 'bg-lavender text-white' : 'hover:bg-gray-200'}`}
            onClick={() => setCurrentFilter('alle')}
          >
            <Filter className="w-4 h-4 mr-1" /> Alle
          </button>
          <button 
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition-colors ${currentFilter === 'aktiv' ? 'bg-lavender text-white' : 'hover:bg-gray-200'}`}
            onClick={() => setCurrentFilter('aktiv')}
          >
            <CheckSquare className="w-4 h-4 mr-1" /> Aktiv
          </button>
          <button 
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition-colors ${currentFilter === 'erledigt' ? 'bg-lavender text-white' : 'hover:bg-gray-200'}`}
            onClick={() => setCurrentFilter('erledigt')}
          >
            <Check className="w-4 h-4 mr-1" /> Erledigt
          </button>
        </div>
      </div>

      <Card title="Neue Aufgabe hinzufügen">
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">{error}</div>}
        
        <form onSubmit={addTodo} className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-3">
            <input
              type="text"
              className="flex-1 p-2.5 border rounded-xl focus:border-lavender focus:ring-1 focus:ring-lavender focus:outline-none"
              placeholder="Neue Aufgabe hinzufügen..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
            />
            
            <input
              type="date"
              className="w-full md:w-48 p-2.5 border rounded-xl focus:border-lavender focus:ring-1 focus:ring-lavender focus:outline-none"
              value={newTodoDueDate}
              onChange={(e) => setNewTodoDueDate(e.target.value)}
            />
            
            <select
              className="w-full md:w-48 p-2.5 border rounded-xl focus:border-lavender focus:ring-1 focus:ring-lavender focus:outline-none"
              value={newTodoPriority || 'mittel'}
              onChange={(e) => setNewTodoPriority(e.target.value as TodoItem['priority'])}
            >
              <option value="hoch">Hohe Priorität</option>
              <option value="mittel">Mittlere Priorität</option>
              <option value="niedrig">Niedrige Priorität</option>
            </select>
            
            <button 
              type="submit" 
              className="w-full md:w-auto bg-lavender text-white py-2.5 px-4 rounded-xl hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Hinzufügen
            </button>
          </div>
        </form>
      </Card>

      <Card title={`Aufgaben (${filteredTodos.length})`}>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Lade Aufgaben...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Keine Aufgaben vorhanden. Füge eine neue Aufgabe hinzu!</div>
        ) : (
          <div className="p-4">
            <ul className="space-y-2">
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={`border rounded-xl p-3 transition-colors ${
                    todo.completed 
                      ? 'bg-gray-50 border-gray-100' 
                      : isOverdue(todo.dueDate) 
                        ? 'bg-red-50 border-red-100' 
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 mt-1 rounded text-lavender focus:ring-lavender focus:ring-offset-0"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id, todo.completed)}
                      />
                      
                      <div>
                        <p className={`text-sm font-medium ${todo.completed ? 'text-gray-500 line-through' : 'text-midnight'}`}>
                          {todo.text}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {todo.dueDate && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isOverdue(todo.dueDate) && !todo.completed 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              <Calendar className="w-3 h-3 mr-1" /> {formatDate(todo.dueDate)}
                            </span>
                          )}
                          
                          {todo.priority && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              todo.priority === 'hoch' 
                                ? 'bg-red-100 text-red-800' 
                                : todo.priority === 'mittel' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {todo.priority === 'hoch' 
                                ? <Flame className="w-3 h-3 mr-1" /> 
                                : todo.priority === 'mittel' 
                                  ? <Zap className="w-3 h-3 mr-1" /> 
                                  : <Leaf className="w-3 h-3 mr-1" />
                              }
                              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                            </span>
                          )}

                          {todo.completed && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" /> Erledigt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => deleteTodo(todo.id)}
                      aria-label="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            
            {todos.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-between gap-3">
                <div className="text-sm text-gray-500">
                  {todos.filter(todo => !todo.completed).length} Aufgaben übrig
                </div>
                
                <div className="flex gap-2">
                  {todos.some(todo => todo.completed) && (
                    <button 
                      onClick={deleteCompletedTodos}
                      className="text-sm text-red-500 hover:text-red-700 transition-colors inline-flex items-center"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Erledigte löschen
                    </button>
                  )}
                  
                  <button 
                    onClick={toggleAllTodos}
                    className="text-sm text-lavender hover:text-lavender/70 transition-colors inline-flex items-center"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> 
                    {todos.every(todo => todo.completed) ? 'Alle deaktivieren' : 'Alle aktivieren'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Todo;