import React from 'react';

function StyleButton({dispatch}) {
  return (
    <div>
      <button onMouseDown={(e) => dispatch("bold", e)}>Bold</button>
      <button onMouseDown={(e) => dispatch("italic", e)}>Italic</button>
      <button onMouseDown={(e) => dispatch("header", e)}>H2</button>
      <button onMouseDown={(e) => dispatch("list", e)}>List</button>
      <button onMouseDown={(e) => dispatch("addLink", e)}>Add Link</button>
      <button onMouseDown={(e) => dispatch("removeLink", e)}>Remove Link</button>
    </div>
  )
}

export default StyleButton;