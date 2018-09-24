#!/bin/bash

INSTANCEIDS=`aws ec2 describe-instances | jq -r '.Reservations[] .Instances[] .InstanceId'`
aws ec2 terminate-instances --instance-ids $INSTANCEIDS