class FarmLinkFilters {
  constructor(baseQuery, queryString) {
    this.baseQuery = baseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Convert to Oracle WHERE clause format
    if (Object.keys(queryObj).length > 0) {
      const whereConditions = Object.keys(queryObj)
        .map(key => `${key} = :${key}`)
        .join(' AND ');
      this.baseQuery += ` WHERE ${whereConditions}`;
    }

    return this;
  }

  searchByQuery() {
    if (this.queryString.search) {
      const searchCondition = `name LIKE '%${this.queryString.search}%' OR email LIKE '%${this.queryString.search}%'`;
      if (this.baseQuery.includes('WHERE')) {
        this.baseQuery += ` AND (${searchCondition})`;
      } else {
        this.baseQuery += ` WHERE (${searchCondition})`;
      }
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.baseQuery += ` ORDER BY ${this.queryString.sort.replace(',', ' ')}`;
    } else {
      this.baseQuery += ' ORDER BY created_at DESC';
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(', ');
      this.baseQuery = this.baseQuery.replace('*', fields);
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const offset = (page - 1) * limit;

    this.baseQuery += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    return this;
  }
}

module.exports = FarmLinkFilters;