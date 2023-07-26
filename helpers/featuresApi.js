class FeaturesApi {
  constructor(reqQuery, reqString, isVisible = true) {
    this.reqQuery = reqQuery;
    this.reqString = reqString;
    this.isVisible = isVisible;
  }

  filter() {
    // const { reqQuery, isVisible } = this;
    const queryObj = { ...this.reqString };
    queryObj.visible = this.isVisible;
    const exclude = ["limit", "page", "sort", "fields", "term"];
    exclude.forEach((field) => delete queryObj[field]);
    const queryString = JSON.stringify(queryObj);

    // const gg = /\b(gte|gt|lte|lt)\b/g;
    // console.log(queryString.match(gg));
    const queryStringCheck = queryString.includes(
      "$lt" || "$lte" || "$gt" || "$gte"
    );

    this.reqQuery = this.reqQuery.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.reqString.sort) {
      const sortBy = this.reqString.sort.split(",").join(" ");
      this.reqQuery = this.reqQuery.sort(sortBy);
    } else {
      this.reqQuery = this.reqQuery.sort("-createdAt");
    }

    return this;
  }

  fields() {
    if (this.reqString.fields) {
      const limitFields = this.reqString.fields.split(",").join(" ");
      this.reqQuery = this.reqQuery.select(limitFields);
    } else {
      this.reqQuery = this.reqQuery.select("-__v");
    }
    return this;
  }

  search() {
    if (this.reqString.term) {
      const { term } = this.reqString;
      this.reqQuery = this.reqQuery.find({
        $or: [
          { name: { $regex: term, $options: "i" } },
          { desc: { $regex: term, $options: "i" } },
        ],
      });
    }
    return this;
  }

  paginate(documentCount) {
    const paginateObj = {};
    const page = Number(this.reqString.page) || 1;
    const limit = Number(this.reqString.limit) || 4;
    const skip = (page - 1) * limit;
    const currentPage = page;
    const numberOfPages = Math.ceil(documentCount / limit);
    const endIdx = limit * page;
    if (documentCount > endIdx) {
      paginateObj.nextPage = page + 1;
    }
    if (skip > 0) {
      paginateObj.previosPage = page - 1;
    }
    paginateObj.currentPage = currentPage;
    paginateObj.limitBy = limit;
    paginateObj.numOfAllPages = numberOfPages;
    paginateObj.numOfAllDocs = documentCount;
    // asign paginationObj to the returnd obj
    this.pagination = paginateObj;

    this.reqQuery = this.reqQuery.skip(skip).limit(limit);

    return this;
  }
}

module.exports = FeaturesApi;