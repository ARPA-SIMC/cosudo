from django.test import TestCase


# Create your tests here.
class MapTestCase(TestCase):

    def test_template(self):
        response = self.client.get('/map/')
        self.assertTemplateUsed(response, 'map.html')
