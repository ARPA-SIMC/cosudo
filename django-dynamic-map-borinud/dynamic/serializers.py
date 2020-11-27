from dynamic.models import Edit, StationEdit, DataEdit, Alarm
from rest_framework import serializers


class StationEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationEdit
        exclude = ["edit"]


class DataEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataEdit
        exclude = ["edit"]


class EditSerializer(serializers.HyperlinkedModelSerializer):
    stationEdits = StationEditSerializer(
        many=True, read_only=True, source="stationedit_set"
    )
    dataEdits = DataEditSerializer(many=True, read_only=True, source="dataedit_set")

    class Meta:
        model = Edit
        fields = [
            "id",
            "created_date",
            "type",
            "data_type",
            "startDate",
            "finalDate",
            "stationEdits",
            "dataEdits",
        ]


class AlarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alarm
        fields = "__all__"


class AlarmEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alarm
        fields = ["status"]