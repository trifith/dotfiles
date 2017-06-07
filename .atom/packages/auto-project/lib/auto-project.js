'use babel';

/* global atom:true */
import { CompositeDisposable, GitRepository } from 'atom';
import fs from 'fs';
import path from 'path';

export default {
  _disposables: null,
  _onlyActiveEvent: null,
  _firstPaths: [],
  _lastPaths: [],
  _pathSet: new Set(),

  config: {
    onlyActive: {
      title: 'Only Active',
      description:
        'Set the project to the specified folders and the (Git) working folder of the active file.',
      type: 'boolean',
      default: false,
    },

    firstFolders: {
      title: 'First Folders',
      description: 'Add the specified folders to the project at first.',
      type: 'array',
      default: [],
      items: {
        type: 'string',
      },
    },

    lastFolders: {
      title: 'Last Folders',
      description: 'Add the specified folders to the project at last.',
      type: 'array',
      default: [],
      items: {
        type: 'string',
      },
    },
  },

  _getCommands() {
    return atom.commands.add('atom-workspace', {
      'auto-project:clear-first-folders': () => {
        atom.config.set('auto-project.firstFolders', []);
      },
      'auto-project:clear-last-folders': () => {
        atom.config.set('auto-project.lastFolders', []);
      },
      'auto-project:save-project-as-first-folders': () => {
        atom.config.set('auto-project.firstFolders', atom.project.getPaths());
      },
      'auto-project:save-project-as-last-folders': () => {
        atom.config.set('auto-project.lastFolders', atom.project.getPaths());
      },
    });
  },

  activate(state) { // eslint-disable-line no-unused-vars
    this._disposables = new CompositeDisposable();
    this._disposables.add(atom.workspace.observePaneItems(this._observeItem.bind(this)));
    this._disposables.add(atom.workspace.onDidDestroyPaneItem(this._updateProject.bind(this)));
    this._disposables.add(atom.config.onDidChange('auto-project.onlyActive', (event) => {
      this._setOnlyActive(event.newValue);
    }));
    this._disposables.add(atom.config.onDidChange('auto-project.firstFolders', (event) => {
      this._observePathConfig(event.newValue);
    }));
    this._disposables.add(atom.config.onDidChange('auto-project.lastFolders', (event) => {
      this._observePathConfig(event.newValue);
    }));
    this._disposables.add(this._getCommands());
    this._setOnlyActive(atom.config.get('auto-project.onlyActive'));
    this._updatePathConfig();
  },

  deactivate() {
    this._disposables.dispose();
  },

  _setOnlyActive(onlyActive) {
    if (this._onlyActiveEvent) {
      this._disposables.remove(this._onlyActiveEvent);
      this._onlyActiveEvent.dispose();
      this._onlyActiveEvent = null;
    }

    if (onlyActive) {
      this._onlyActiveEvent = atom.workspace.onDidChangeActivePaneItem(() => {
        this._updateProject();
      });
      this._disposables.add(this._onlyActiveEvent);
    }
    this._updateProject();
  },

  _observePathConfig(newPaths) {
    if (newPaths.every(p => this._isDirectory(p))) {
      this._updatePathConfig();
    }
  },

  _updatePathConfig() {
    this._firstPaths = this._getValidPaths(atom.config.get('auto-project.firstFolders'));
    this._lastPaths = this._getValidPaths(atom.config.get('auto-project.lastFolders'));
    const paths = [...this._firstPaths, ...this._lastPaths];
    this._pathSet = new Set(paths);
    if (atom.config.get('auto-project.onlyActive')) {
      atom.project.setPaths(paths);
    } else {
      this._updateProject();
    }
  },

  _getValidPaths(paths) {
    const list = [];
    paths.forEach((p) => {
      if (this._isDirectory(p)) {
        list.push(path.normalize(`${p}/`).slice(0, -1));
      }
    });
    return list;
  },

  _observeItem(item) {
    if (typeof item.getPath !== 'function') {
      return;
    }
    if (typeof item.onDidChangePath === 'function' && typeof item.onDidDestroy === 'function') {
      const onDidChangePath = item.onDidChangePath(this._updateProject.bind(this));
      const onDidDestroy = item.onDidDestroy(() => {
        this._disposables.remove(onDidChangePath);
        this._disposables.remove(onDidDestroy);
      });
      this._disposables.add(onDidChangePath, onDidDestroy);
    }

    this._updateProject();
  },

  _updateProject() {
    const openedPaths = this._getOpenedPaths();
    if (!openedPaths) {
      return;
    }

    const newPaths = [...this._firstPaths, ...openedPaths, ...this._lastPaths];
    if (newPaths.length === 0 || this._compareArray(newPaths, atom.project.getPaths())) {
      return;
    }

    setTimeout(() => { // for onDidChangePath
      atom.project.setPaths(newPaths);
      if (atom.config.get('tree-view.autoReveal') && atom.packages.getActivePackage('tree-view')) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:reveal-active-file');
      }
    }, 0);
  },

  _getOpenedPaths() {
    let openedItems;
    const openedSet = new Set();
    const openedPaths = [];
    const newPaths = [];

    if (!atom.config.get('auto-project.onlyActive')) {
      openedItems = atom.workspace.getPaneItems();
    } else {
      const item = atom.workspace.getActivePaneItem();
      if (!item) {
        return [];
      }
      if (typeof item.getPath !== 'function' || !item.getPath()) {
        return null;
      }
      openedItems = [item];
    }

    openedItems.forEach((item) => {
      if (typeof item.getPath !== 'function') {
        return;
      }
      const file = item.getPath();
      if (!file) {
        return;
      }
      let dir = path.dirname(file);
      const repo = GitRepository.open(dir, { refreshOnWindowFocus: false });
      dir = repo ? repo.getWorkingDirectory() : dir;
      dir = path.normalize(dir);
      if (!this._pathSet.has(dir) && !openedSet.has(dir)) {
        openedSet.add(dir);
        openedPaths.push(dir);
      }
    });

    atom.project.getPaths().forEach((p) => {
      if (openedSet.has(p)) {
        newPaths.push(p);
        openedSet.delete(p);
      }
    });

    openedPaths.forEach((p) => {
      if (openedSet.has(p)) {
        newPaths.push(p);
      }
    });

    return newPaths;
  },

  _isDirectory(p) {
    try {
      if (!fs.statSync(p).isDirectory()) {
        return true;
      }
    } catch (err) {
      return false;
    }
    return true;
  },

  _compareArray(array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
    for (let i = array1.length - 1; i >= 0; i -= 1) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  },
};
