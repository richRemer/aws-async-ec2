Async wrapper for AWS SDK EC2 API.

EC2 Usage
=========

```js
const AWS = require("aws-sdk");
const {EC2} = require("aws-async-ec2");
const ec2 = new EC2(AWS);

async function listInstanceIds() {
    for await (const {RegionName} of ec2.describeRegions()) {
        console.log("instances in", RegionName);

        const ec2region = ec2.selectRegion(RegionName);

        for await (const instance of ec2region.describeInstances()) {
            console.log(instance.InstanceId);
        }
    }
}
```
