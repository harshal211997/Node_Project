class createApiFeature {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {...this.queryString};
        const excludeFields = ['page', 'sort', 'limit','field'];
        excludeFields.forEach(el => delete queryObj[el]);
        //will give data from query string from URL
        //using URL query string to filter data: API filtering

        //2)Advance URL query filtering as gt, gte, lt, lte
        //normal mongoDB filter {difficulty: 'easy', duration: {$gte: 5}}
        let queryStr = JSON.stringify(queryObj)//javaScript Object to json string
        queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`));// $gte
        this.query.find(queryStr);
        return this;
    }
    //3)Sorting: sorting data by price using URL query string
    //e.g: localhost:8000/api/v1/tours?sort=price (default sort will be ASC)
    //To sort it DESC localhost:8000/api/v1/tours?sort=-price
    sort() {
        if(this.queryString.sort){
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query.sort(sortBy);
        }else{
            this.query.sort('-createdAt')
        }
      return this;
    }
    //4.)field Limiting the result(fetchining only certain columns)
    // //to field limit result will use fields filter
    // //URL: localhost:8000/api/v1/tours?field=name,duration,price
    // //In mongoDB query if we want to filter data for particular column will use select query
    // //e.g query.select('name duration price')
    limitField() {
        if(this.queryString.field){
            const fields = this.queryString.field.split(',').join(' ');
            this.query = this.query.select(fields)
        }else{
            this.query.select('-__v');
        }
        return this;
    }
    //5.)Pagination and limit:
        //If we have 1000 data then its not good practice to show all data at a time
        //to avoid that will use pagination where we will display limited amount of data as per user input
        //e.g URL=localhost:8000/api/v1/tours?page=2&limit=3: user wants to see page 2 and on each page limit of document is 3
        //logic behind pagination is e.g page=2&limit=3: page 1 : 1-3 documents, page :2 4-6(document)
        //will use req.query.page and req.query.limit to get query value from URL
        //In mongoDB we have query like Tour.skip(3).limit(2)
        //simply skip() value will decide the page number
        //in skip() we need to pass how many result we want to skip to get page 2 
    paginate(){
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query.skip(skip).limit(limit);
    }
};

module.exports = createApiFeature;