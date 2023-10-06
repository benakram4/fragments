// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// we know that ownerId and id can be only strings
const validateKey = (key) => typeof key === 'string';

// validate that the size is a positive number
const validateSize = (size) => typeof size === 'number' && size >= 0;

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({
    id = randomUUID(),
    ownerId,
    created = new Date().toUTCString(),
    updated = new Date().toUTCString(),
    type,
    size = 0,
  }) {
    // ounerId and id are required
    if (!(validateKey(ownerId) && validateKey(id))) {
      throw new Error(`ownerId and id strings are required, got ownerId=${ownerId}, id=${id}`);
    }

    // type is required
    if (!type) {
      throw new Error(`type string is required, got type=${type}`);
    }
    // type can be a simple media type and type can include a charset
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`this type is not supported, got type=${type}`);
    }

    // size must be a number and must be a positive number
    if (!validateSize(size)) {
      throw new Error(`size must be a number, got size=${size}`);
    }

    this.id = id;
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    return fragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`Fragment with id ${id} not found`);
    }
    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    // update the updated date/time of the fragment
    this.updated = new Date().toUTCString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // throws if not give a Buffer
    if (!data) {
      throw new Error(`data is required, got data=${data}`);
    }
    this.size = Buffer.byteLength(data);
    this.updated = new Date().toUTCString();
    await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const formats = [];

    if (this.isText) {
      formats.push('text/plain');
      // ! commented code is for future use
      // formats.push('text/markdown');
      // formats.push('text/html');
      //? I think that we should add this one too or it has a special case?
      // formats.push('application/json');
    } else {
      // ! commented code is  for future use
      // formats.push('image/png');
      // formats.push('image/jpeg');
      // formats.push('image/webp');
      // formats.push('image/gif');
    }

    return formats;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const validTypes = [
      `text/plain`,
      /*
        Currently, only text/plain is supported. Others will be added later.
    
      `text/markdown`,
      `text/html`,
      `application/json`,
      `image/png`,
      `image/jpeg`,
      `image/webp`,
      `image/gif`,
      */
    ];

    // deals with the case where the type includes a charset
    const { type } = contentType.parse(value);
    return validTypes.includes(type);
  }
}

module.exports.Fragment = Fragment;
