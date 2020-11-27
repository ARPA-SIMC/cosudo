import requests
import datetime
from dynamic.models import Alarm


def get_occurency(summary):
    occurency = {}
    for data in summary:
        key = "{}|{}|{}|{}|{}|{}|{}".format(
            data["ident"],
            data["lon"],
            data["lat"],
            data["network"],
            list(data["data"][0]["vars"].keys())[0],
            ",".join(map(str, data["data"][0]["timerange"])),
            ",".join(map(str, data["data"][0]["level"])),
        )

        if key not in occurency:
            occurency[key] = 0
        occurency[key] += 1
    return occurency


def return_dict_from_string(string):
    splitted = string.split("|")
    try:
        return {
            "ident": splitted[0],
            "lon": splitted[1],
            "lat": splitted[2],
            "network": splitted[3],
            "bcode": splitted[4],
            "trange": splitted[5],
            "level": splitted[6],
        }
    except IndexError:
        return False


def get_strings_time(date):
    try:
        date = datetime.datetime.strptime(date, "%d/%m/%Y %H:%M:%S")
        date_day = date.strftime("%d")
        date_month = date.strftime("%m")
        date_year = date.strftime("%Y")
        date_hour = date.strftime("%H")
        date_min = date.strftime("%M")
        date_sec = date.strftime("%S")
        return {
            "day": date_day,
            "month": date_month,
            "year": date_year,
            "hour": date_hour,
            "min": date_min,
            "sec": date_sec,
        }
    except (ValueError, TypeError):
        return False


def returnParamsDate(dict_date_start, dict_date_end):
    return {
        "yearmin": dict_date_start["year"],
        "monthmin": dict_date_start["month"],
        "daymin": dict_date_start["day"],
        "hourmin": dict_date_start["hour"],
        "minumin": dict_date_start["min"],
        "secmin": dict_date_start["sec"],
        "yearmax": dict_date_end["year"],
        "monthmax": dict_date_end["month"],
        "daymax": dict_date_end["day"],
        "hourmax": dict_date_end["hour"],
        "minumax": dict_date_end["min"],
        "secmax": dict_date_end["sec"],
    }


def compare_summaries_data(
    first_period_start_date,
    first_period_end_date,
    second_period_start_date,
    second_period_end_date,
):
    first_url = "http://0.0.0.0:8888/borinud/api/v1/dbajson/*/*/*/*/*/*/summaries"
    second_url = "https://test.rmap.cc/borinud/api/v1/dbajson/*/*/*/*/*/*/summaries"
    first_period_start_date = get_strings_time(first_period_start_date)
    first_period_end_date = get_strings_time(first_period_end_date)
    second_period_start_date = get_strings_time(second_period_start_date)
    second_period_end_date = get_strings_time(second_period_end_date)

    if (
        first_period_end_date
        and first_period_start_date
        and second_period_end_date
        and second_period_start_date
    ):

        try:
            summary_first = requests.get(
                first_url,
                params=returnParamsDate(first_period_start_date, first_period_end_date),
            ).json()

            summary_second = requests.get(
                second_url,
                params=returnParamsDate(
                    second_period_start_date, second_period_end_date
                ),
            ).json()

            first_occurency = get_occurency(summary_first)
            second_occurency = get_occurency(summary_second)

            for key, value in first_occurency.items():
                if key not in second_occurency:
                    # create alarm
                    dict_key = return_dict_from_string(key)
                    if not dict_key:
                        return "Error"
                    if not Alarm.objects.filter(
                        ident=dict_key["ident"],
                        lon=dict_key["lon"],
                        lat=dict_key["lat"],
                        network=dict_key["network"],
                        var=dict_key["bcode"],
                        trange=dict_key["trange"],
                        level=dict_key["level"],
                        status="a",
                    ).first():
                        Alarm(
                            ident=dict_key["ident"],
                            lon=dict_key["lon"],
                            lat=dict_key["lat"],
                            network=dict_key["network"],
                            var=dict_key["bcode"],
                            trange=dict_key["trange"],
                            level=dict_key["level"],
                            status="a",
                        ).save()
            return "success"
        except requests.exceptions.RequestException:  # This is the correct syntax
            return "Service not available"
    return 'Wrong date format, use "%d/%m/%Y %H:%M:%S" '


# if __name__ == "__main__":

#     first_period_start_date = datetime.datetime.today()
#     first_period_end_date = datetime.datetime.today()
#     second_period_start_date = datetime.datetime.today()
#     second_period_end_date = datetime.datetime.today()

#     print(
#         compare_summaries_data(
#             first_period_start_date,
#             first_period_end_date,
#             second_period_start_date,
#             second_period_end_date,
#         )
#     )
