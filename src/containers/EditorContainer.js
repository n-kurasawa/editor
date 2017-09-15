import React from 'react';
import MicroContainer from 'react-micro-container';
import {Editor, EditorState, RichUtils, CompositeDecorator, convertToRaw} from 'draft-js';
import exporter from 'draft-js-ast-exporter';
import StyleButton from '../components/StyleButton';
import LinkDecorator from '../decorator/LinkDecorator';

class EditorContainer extends MicroContainer {
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([LinkDecorator]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      showURLInput: false,
      urlValue: '',
    };
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.confirmLink = this._confirmLink.bind(this);
    this.focus = () => this.refs.editor.focus();
    this.onURLChange = (e) => this.setState({urlValue: e.target.value});
    this.logState = () => {
      const content = this.state.editorState.getCurrentContent();
      console.log("====== RAW Content ======");
      console.log(convertToRaw(content));
      console.log("====== AST ======");
      console.log(exporter(this.state.editorState));
    };
  }

  componentDidMount() {
    this.subscribe({
      change: this.handleEditorChange,
      bold: this.handleBoldClick,
      italic: this.handleItalicClick,
      header: this.handleHeaderClick,
      list: this.handleListClick,
      addLink: this.handleAddLinkClick,
      removeLink: this.handleRemoveLinkClick,
    });
  }

  handleEditorChange(editorState) {
    this.setState({editorState})
  }

  _handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.dispatch("change", newState);
      return true
    }
    return false
  }

  handleBoldClick(e) {
    e.preventDefault();
    this.dispatch("change", RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }

  handleItalicClick(e) {
    e.preventDefault();
    this.dispatch("change", RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
  }

  handleHeaderClick(e) {
    e.preventDefault();
    this.dispatch("change", RichUtils.toggleBlockType(this.state.editorState, 'header-two'));
  }

  handleListClick(e) {
    e.preventDefault();
    this.dispatch("change", RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item'));
  }

  handleAddLinkClick(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = editorState.getSelection().getStartKey();
      const startOffset = editorState.getSelection().getStartOffset();
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
      let url = '';
      if (linkKey) {
        const linkInstance = contentState.getEntity(linkKey);
        url = linkInstance.getData().url;
      }
      this.setState({
        showURLInput: true,
        urlValue: url,
      }, () => {
        setTimeout(() => this.refs.url.focus(), 0);
      });
    }
  }

  handleRemoveLinkClick(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        editorState: RichUtils.toggleLink(editorState, selection, null),
      });
    }
  }

  _confirmLink(e) {
    e.preventDefault();
    const {editorState, urlValue} = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      {url: urlValue}
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    this.setState({
      editorState: RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey),
      showURLInput: false,
      urlValue: '',
    }, () => {
      setTimeout(() => this.refs.editor.focus(), 0);
    });
  }

  render() {
    let urlInput;
    if (this.state.showURLInput) {
      urlInput =
        <div>
          <input
            onChange={this.onURLChange}
            ref="url"
            type="text"
            value={this.state.urlValue}
            onKeyDown={this.onLinkInputKeyDown}
          />
          <button onMouseDown={this.confirmLink}>
            Confirm
          </button>
        </div>;
    }

    return (
      <div style={styles.root}>
        <StyleButton dispatch={this.dispatch}/>
        {urlInput}
        <div style={styles.editor} onClick={this.focus}>
          <Editor editorState={this.state.editorState}
                  ref="editor"
                  onChange={(state) => this.dispatch("change", state)}
                  handleKeyCommand={this.handleKeyCommand}
          />
        </div>
        <input onClick={this.logState} type="button" value="Log State"/>
      </div>
    )
  }
}
export default EditorContainer;

const styles = {
  root: {
    fontFamily: '\'Georgia\', serif',
    padding: 20,
    width: 600,
  },
  editor: {
    border: '1px solid #ccc',
    cursor: 'text',
    minHeight: 80,
    padding: 10,
  },
};