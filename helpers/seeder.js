const fs = require("fs");
const postsModel = require("../schemas/posts.schema");

// destroy data from database model
const deleteData = async () => {
	try {
		const destroy = await postsModel.deleteMany();
		if (destroy) {
			console.log("Data Destroyed".red.inverse);
			process.exit();
		}
	} catch (error) {
		console.log(error);
	}
};

if (process.argv[2] === "-d") {
	deleteData();
}
