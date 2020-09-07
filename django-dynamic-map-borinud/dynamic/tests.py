from django.test import TestCase
from django.conf import settings


# Create your tests here.
class MapTestCase(TestCase):

    def test_template(self):
        response = self.client.get('/map/')
        self.assertTemplateUsed(response, 'map.html')

    def test_context(self):
        response = self.client.get('/map/')
        url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
        self.assertEqual(response.context['url_borinud'], url)
