import moment from "moment";

function findDifference<T>(arr1: T[], arr2: T[]) {
  return arr1.filter((id1) => !arr2.some((id2) => id2 === id1)).pop();
}

function findLastEvent<T>(events: any[], f: (arg0: T) => boolean) {
  return events
    .filter((e) => f(e as T))
    .sort((e1, e2) => moment(e1.timeStamp).unix() - moment(e2.timeStamp).unix())
    .pop();
}

export { findDifference, findLastEvent };
