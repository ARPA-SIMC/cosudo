from django.test import TestCase


# Create your tests here.
class MapTestCase(TestCase):

    def test_template(self):
        """Animals that can speak are correctly identified"""
        response = self.client.get('/map/')
        self.assertTemplateUsed(response, 'map.html')
