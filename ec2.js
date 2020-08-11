const paginate = require("aws-async-paginate");
const NO_REGION = "us-east-1";

class EC2 {
    constructor(sdk) {
        this.sdk = sdk;
        this.ec2 = new sdk.EC2();
        this.region = {any: new sdk.EC2({region: NO_REGION})};
    }

    selectRegion(region) {
        if (!this.region[region]) {
            this.region[region] = new Region(this, region);
        }

        return this.region[region];
    }

    async *describeRegions() {
        const regions = await this.region.any.describeRegions().promise();
        yield* regions.Regions;
    }
}

module.exports = {EC2};

class Region {
    constructor(ec2, region) {
        this.ec2 = new ec2.sdk.EC2({region});
        this.region = region;
    }

    async *describeImages() {
        const fn = params => this.ec2.describeImages(params);
        yield* paginate(fn, "Images");
    }

    async *describeInstances() {
        const fn = params => this.ec2.describeInstances(params);

        for await (const reservation of paginate(fn, "Reservations")) {
            yield* reservation.Instances;
        }
    }

    async *describeSubnets() {
        const fn = params => this.ec2.describeSubnets(params);
        yield* paginate(fn, "Subnets");
    }

    async runInstances(InstanceType, ImageId, params={}) {
        params = {MinCount: 1, MaxCount: 1, ...params, InstanceType, ImageId};
        return this.ec2.runInstances(params).promise();
    }

    async terminateInstances(...InstanceIds) {
        return this.ec2.terminateInstances({InstanceIds}).promise();
    }
}
